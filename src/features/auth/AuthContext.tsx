import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabase } from '../../lib/dataSource'
import { supabase } from '../../lib/supabaseClient'
import { CompanyInactiveError, UserInactiveError, fetchOwnProfile, loginRequest, loginWithGoogle, toPendingGoogleUser, type NoCompanySession, type PendingGoogleUser } from './api'
import type { AuthUser } from './types'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticating: boolean
  error: string | null
  /** set when Google auth just succeeded but no profile exists yet — the signup page shows a mini-form to finish it */
  pendingGoogleUser: PendingGoogleUser | null
  clearPendingGoogleUser: () => void
  /** set for any authenticated session with no company profile (e.g. after "Sair da empresa") —
   * a maintenance account (see maintenanceNoCompany) lands in the maintenance panel, everyone
   * else lands on the signup page's "join a company" screen, reusing the same identity shape
   * as a fresh Google signup. */
  noCompanySession: NoCompanySession | null
  clearNoCompanySession: () => void
  /** true when the current login's email is in maintenance_accounts — works whether or not
   * the account also has a normal company profile (additive, see [[project-backlog-20260720]]) */
  isMaintenanceAccount: boolean
  /** false until the maintenance check above has resolved at least once for the current
   * session — guards against briefly bouncing a real maintenance account off /manutencao
   * on a hard refresh, before isMaintenanceAccount has had a chance to come back true */
  maintenanceChecked: boolean
  /** derived from noCompanySession — true only when that session's email is a maintenance account */
  maintenanceNoCompany: boolean
  /** re-runs the maintenance check without a full login — call after redeeming a maintenance invite code */
  refreshMaintenanceStatus: () => Promise<void>
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
  const [noCompanySession, setNoCompanySession] = useState<NoCompanySession | null>(null)
  const [isMaintenanceAccount, setIsMaintenanceAccount] = useState(false)
  const [maintenanceChecked, setMaintenanceChecked] = useState(false)
  const maintenanceNoCompany = !!noCompanySession && isMaintenanceAccount

  // maintenance status is orthogonal to having a company profile — checked for both a normal
  // `user` session and a bare `noCompanySession`, whichever is currently resolved
  useEffect(() => {
    if (!isSupabase) {
      setMaintenanceChecked(true)
      return
    }
    const email = user?.email ?? noCompanySession?.email
    if (!email) {
      setIsMaintenanceAccount(false)
      setMaintenanceChecked(true)
      return
    }
    let cancelled = false
    setMaintenanceChecked(false)
    supabase!.rpc('is_maintenance_account').then(({ data }) => {
      if (!cancelled) {
        setIsMaintenanceAccount(!!data)
        setMaintenanceChecked(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [user?.email, noCompanySession?.email])

  /** Re-runs the maintenance check on demand — used right after redeeming a maintenance invite
   * code, since the automatic check above only fires when user/noCompanySession identity changes,
   * not when someone gains the privilege mid-session without a new login. */
  async function refreshMaintenanceStatus() {
    if (!isSupabase) return
    const { data } = await supabase!.rpc('is_maintenance_account')
    setIsMaintenanceAccount(!!data)
  }

  // Listen for another admin changing this user's own role/department/status live — so an
  // active session picks it up immediately instead of needing a reload to see new permissions,
  // and an account marked inativo gets signed out right away rather than keeping a stale session.
  // Also covers being removed from the company entirely (profiles row deleted, login kept per
  // 031) — previously only UPDATE was watched, so a removed user's session kept working (against
  // RLS that now silently returned nothing) until they happened to reload.
  useEffect(() => {
    if (!isSupabase || !user) return
    const userId = user.id
    const channel = supabase!
      .channel(`profile-self-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setUser(null)
            supabase!.auth.getUser().then(({ data }) => {
              if (data.user) setNoCompanySession(toPendingGoogleUser(data.user))
            })
            return
          }
          const next = payload.new as { role: string; department: string | null; status: 'ativo' | 'inativo' }
          if (next.status === 'inativo') {
            setUser(null)
            setError('Você está inativo nesta empresa.')
            supabase!.auth.signOut()
            return
          }
          setUser((prev) => (prev ? { ...prev, role: next.role as AuthUser['role'], department: next.department ?? undefined } : prev))
        },
      )
      .subscribe()
    return () => {
      supabase!.removeChannel(channel)
    }
  }, [user?.id])

  // Same idea, one level up: an admin/maintenance account deactivating this user's whole company
  // should sign everyone in it out immediately, not just at their next login attempt.
  useEffect(() => {
    if (!isSupabase || !user?.companyId) return
    const companyId = user.companyId
    const channel = supabase!
      .channel(`company-self-${companyId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'companies', filter: `id=eq.${companyId}` },
        (payload) => {
          const next = payload.new as { status: 'ativo' | 'inativo' }
          if (next.status === 'inativo') {
            setUser(null)
            setError('Sua empresa foi desativada. Entre em contato com o suporte.')
            supabase!.auth.signOut()
          }
        },
      )
      .subscribe()
    return () => {
      supabase!.removeChannel(channel)
    }
  }, [user?.companyId])

  // Mirrors the profile-self channel above for a maintenance account's own row: without this, a
  // revoked maintenance session kept setIsMaintenanceAccount(true) (and access to /manutencao)
  // until the next full reload, since the check further up only re-runs on identity change.
  useEffect(() => {
    if (!isSupabase || !isMaintenanceAccount) return
    const email = user?.email ?? noCompanySession?.email
    if (!email) return
    const channel = supabase!
      .channel(`maintenance-self-${email}`)
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'maintenance_accounts', filter: `email=eq.${email}` },
        () => {
          setIsMaintenanceAccount(false)
          if (!user) {
            // a bare maintenance session (no company at all) has nothing left to show without this
            setError('Seu acesso de manutenção foi removido.')
            setNoCompanySession(null)
            supabase!.auth.signOut()
          }
        },
      )
      .subscribe()
    return () => {
      supabase!.removeChannel(channel)
    }
  }, [isMaintenanceAccount, user?.email, noCompanySession?.email])

  useEffect(() => {
    if (isSupabase) {
      function handleSignedIn(sessionUser: User) {
        const oauthIntent = new URLSearchParams(window.location.search).get('oauthIntent')
        return fetchOwnProfile(sessionUser.id)
          .then((authUser) => {
            setUser(authUser)
            setNoCompanySession(null)
            if (oauthIntent) window.history.replaceState({}, '', window.location.pathname)
          })
          .catch((err) => {
            if (err instanceof CompanyInactiveError || err instanceof UserInactiveError) {
              setError(err.message)
              return
            }
            if (oauthIntent) {
              // authenticated with Google but no profile yet — the signup page finishes this with a mini-form
              setPendingGoogleUser(toPendingGoogleUser(sessionUser))
              return
            }
            // authenticated, no company profile — the owner lands in Central de Suporte, everyone
            // else lands on the signup page's "join a company" screen (see noCompanySession above)
            setNoCompanySession(toPendingGoogleUser(sessionUser))
          })
      }

      supabase!.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          // keep isLoading true until the profile fetch resolves — otherwise ProtectedRoute sees
          // isLoading=false with user still null and bounces a valid session to /login
          handleSignedIn(data.session.user).finally(() => setIsLoading(false))
        } else {
          setIsLoading(false)
        }
      })

      const { data: subscription } = supabase!.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setPendingGoogleUser(null)
          setNoCompanySession(null)
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
        setNoCompanySession(null)
        if (!isSupabase) localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
      } else {
        // signed in fine, but no company profile — fetch the session user to build the identity
        // the join-a-company screen (or Central de Suporte, for the owner) needs
        const { data } = await supabase!.auth.getUser()
        if (data.user) setNoCompanySession(toPendingGoogleUser(data.user))
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
    setNoCompanySession(null)
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

  function clearNoCompanySession() {
    setNoCompanySession(null)
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
        noCompanySession,
        clearNoCompanySession,
        isMaintenanceAccount,
        maintenanceChecked,
        maintenanceNoCompany,
        refreshMaintenanceStatus,
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
