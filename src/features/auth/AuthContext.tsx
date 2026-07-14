import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabase } from '../../lib/dataSource'
import { isPraxisOwner } from '../../lib/praxisOwner'
import { supabase } from '../../lib/supabaseClient'
import { fetchOwnProfile, loginRequest, loginWithGoogle, toPendingGoogleUser, type PendingGoogleUser } from './api'
import type { AuthUser } from './types'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticating: boolean
  error: string | null
  /** set when Google auth just succeeded but no profile exists yet — the signup page shows a mini-form to finish it */
  pendingGoogleUser: PendingGoogleUser | null
  clearPendingGoogleUser: () => void
  /** true when a valid, authenticated session belongs to the Praxis owner but has no company profile
   * (e.g. after using "Sair da empresa") — lets them still reach the Central de Suporte inbox. */
  ownerNoCompany: boolean
  login: (email: string, password: string) => Promise<AuthUser | null>
  loginWithGoogle: () => void
  setSessionUser: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_KEY = 'praxis-auth-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingGoogleUser, setPendingGoogleUser] = useState<PendingGoogleUser | null>(null)
  const [ownerNoCompany, setOwnerNoCompany] = useState(false)

  useEffect(() => {
    if (isSupabase) {
      function handleSignedIn(sessionUser: User) {
        const oauthIntent = new URLSearchParams(window.location.search).get('oauthIntent')
        fetchOwnProfile(sessionUser.id)
          .then((authUser) => {
            setUser(authUser)
            setOwnerNoCompany(false)
            if (oauthIntent) window.history.replaceState({}, '', window.location.pathname)
          })
          .catch(() => {
            if (oauthIntent) {
              // authenticated with Google but no profile yet — the signup page finishes this with a mini-form
              setPendingGoogleUser(toPendingGoogleUser(sessionUser))
              return
            }
            if (isPraxisOwner(sessionUser.email)) {
              // the owner left every company on purpose ("Sair da empresa") — keep the session,
              // just route them to the Central de Suporte inbox instead of signing them out
              setOwnerNoCompany(true)
              return
            }
            setError('Não encontramos uma conta com esse e-mail. Crie uma conta primeiro.')
            supabase!.auth.signOut()
          })
      }

      supabase!.auth.getSession().then(({ data }) => {
        if (data.session?.user) handleSignedIn(data.session.user)
        setIsLoading(false)
      })

      const { data: subscription } = supabase!.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setPendingGoogleUser(null)
          setOwnerNoCompany(false)
        } else if (event === 'SIGNED_IN' && session?.user) {
          // password login/signup already handle their own profile fetch/creation inline (and are mid-flight
          // when their own supabase.auth.signUp()/signInWithPassword() call fires this same event) — reacting
          // here too would race their profile insert and sign the user right back out. Google OAuth is the one
          // case with no calling function to hook into (the browser fully left and came back), so this only
          // needs to run for that.
          if (session.user.app_metadata?.provider === 'google') handleSignedIn(session.user)
        }
      })
      return () => subscription.subscription.unsubscribe()
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  async function login(email: string, password: string) {
    setIsAuthenticating(true)
    setError(null)
    try {
      const authUser = await loginRequest(email, password)
      if (authUser) {
        setUser(authUser)
        setOwnerNoCompany(false)
        if (!isSupabase) localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
      } else {
        // signed in fine, but no company profile — only possible for the Praxis owner (see loginRequest)
        setOwnerNoCompany(true)
      }
      return authUser
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível entrar.'
      setError(message)
      throw err
    } finally {
      setIsAuthenticating(false)
    }
  }

  function setSessionUser(authUser: AuthUser) {
    setUser(authUser)
    if (!isSupabase) localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
  }

  function logout() {
    setUser(null)
    setPendingGoogleUser(null)
    setOwnerNoCompany(false)
    if (isSupabase) {
      supabase!.auth.signOut()
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function clearPendingGoogleUser() {
    setPendingGoogleUser(null)
    if (isSupabase) supabase!.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticating,
        error,
        pendingGoogleUser,
        clearPendingGoogleUser,
        ownerNoCompany,
        login,
        loginWithGoogle,
        setSessionUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
