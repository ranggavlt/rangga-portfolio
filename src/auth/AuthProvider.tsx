import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { AuthService, DemoSession } from './authService'

type AuthContextValue = {
  session: DemoSession | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ service, children }: { service: AuthService; children: ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(service.getSession())
  const [loading, setLoading] = useState(false)

  useEffect(() => service.subscribe(setSession), [service])

  const value = useMemo(() => ({
    session,
    loading,
    async signIn(email: string, password: string) {
      setLoading(true)
      try { await service.signIn(email, password) } finally { setLoading(false) }
    },
    signOut: () => service.signOut(),
  }), [loading, service, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
