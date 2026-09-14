import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { AuthService, AuthSession } from './authService'

type AuthContextValue = {
  session: AuthSession | null
  loading: boolean
  error: string | null
  mode: AuthService['mode']
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ service, onSessionChange, children }: { service: AuthService; onSessionChange?: () => void | Promise<void>; children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(service.getSession())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const unsubscribe = service.subscribe((nextSession) => {
      setSession(nextSession)
      void Promise.resolve(onSessionChange?.()).catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Portfolio refresh failed after the authentication session changed.')
      })
    })
    service.initialize()
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Authentication initialization failed.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true; unsubscribe() }
  }, [onSessionChange, service])

  const value = useMemo(() => ({
    session,
    loading,
    error,
    mode: service.mode,
    async signIn(email: string, password: string) {
      setLoading(true)
      setError(null)
      try { await service.signIn(email, password) } finally { setLoading(false) }
    },
    signOut: () => service.signOut(),
  }), [error, loading, service, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
