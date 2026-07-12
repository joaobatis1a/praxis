import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { loginRequest } from './api'
import type { AuthUser } from './types'

interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticating: boolean
  error: string | null
  login: (email: string, password: string) => Promise<AuthUser>
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

  useEffect(() => {
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
      setUser(authUser)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticating, error, login, setSessionUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
