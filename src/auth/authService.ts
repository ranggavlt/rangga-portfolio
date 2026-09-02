export type AuthSession = {
  userId: string
  email: string
  name: string
  signedInAt: string
}

export interface AuthService {
  readonly mode: 'local' | 'supabase'
  getSession(): AuthSession | null
  initialize(): Promise<void>
  signIn(email: string, password: string): Promise<AuthSession>
  signOut(): Promise<void>
  subscribe(listener: (session: AuthSession | null) => void): () => void
}

const DEMO_AUTH_KEY = 'rangga-portfolio-demo-auth-v1'

/**
 * Frontend-only auth adapter. Replace this implementation with Supabase Auth
 * in the integration layer without changing AuthProvider or admin pages.
 */
export class DemoAuthService implements AuthService {
  readonly mode = 'local' as const
  private listeners = new Set<(session: AuthSession | null) => void>()

  getSession() {
    if (typeof window === 'undefined') return null
    const stored = window.localStorage.getItem(DEMO_AUTH_KEY)
    if (!stored) return null
    try { return JSON.parse(stored) as AuthSession } catch { return null }
  }

  async initialize() {}

  async signIn(email: string, password: string) {
    await new Promise((resolve) => window.setTimeout(resolve, 420))
    if (email.trim().toLowerCase() !== 'demo@rangga.dev' || password !== 'demo') {
      throw new Error('Use the demo credentials shown on this page.')
    }
    const session = { userId: 'local-demo-user', email: email.trim().toLowerCase(), name: 'Demo editor', signedInAt: new Date().toISOString() }
    window.localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(session))
    this.listeners.forEach((listener) => listener(session))
    return session
  }

  async signOut() {
    window.localStorage.removeItem(DEMO_AUTH_KEY)
    this.listeners.forEach((listener) => listener(null))
  }

  subscribe(listener: (session: AuthSession | null) => void) { this.listeners.add(listener); return () => this.listeners.delete(listener) }
}
