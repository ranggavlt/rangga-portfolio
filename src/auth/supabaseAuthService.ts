import { AuthChangeEvent, Session, SupabaseClient } from '@supabase/supabase-js'
import { AuthService, AuthSession } from './authService'
import { Database } from '../lib/database.types'

export class SupabaseAuthService implements AuthService {
  readonly mode = 'supabase' as const
  private session: AuthSession | null = null
  private listeners = new Set<(session: AuthSession | null) => void>()
  private unsubscribe: (() => void) | null = null

  constructor(private readonly client: SupabaseClient<Database>) {}

  getSession() { return this.session }

  async initialize() {
    const { data, error } = await this.client.auth.getSession()
    if (error) throw new Error(`Could not restore the Supabase session: ${error.message}`)
    this.session = await this.toAdminSession(data.session)
    if (data.session && !this.session) {
      await this.client.auth.signOut()
      throw new Error('Access denied. This account is not registered as a portfolio administrator.')
    }
    this.emit()

    if (!this.unsubscribe) {
      const { data: subscription } = this.client.auth.onAuthStateChange((event, session) => {
        void this.handleAuthChange(event, session)
      })
      this.unsubscribe = () => subscription.subscription.unsubscribe()
    }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw new Error(error.message)
    const session = await this.toAdminSession(data.session)
    if (!session) {
      await this.client.auth.signOut()
      throw new Error('Access denied. This account is not registered as a portfolio administrator.')
    }
    this.session = session
    this.emit()
    return session
  }

  async signOut() {
    const { error } = await this.client.auth.signOut()
    if (error) throw new Error(`Could not sign out: ${error.message}`)
    this.session = null
    this.emit()
  }

  subscribe(listener: (session: AuthSession | null) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private async handleAuthChange(event: AuthChangeEvent, session: Session | null) {
    if (event === 'SIGNED_OUT' || !session) {
      this.session = null
      this.emit()
      return
    }
    try {
      this.session = await this.toAdminSession(session)
      if (!this.session) await this.client.auth.signOut()
      this.emit()
    } catch (error) {
      console.error(error)
      this.session = null
      this.emit()
    }
  }

  private async toAdminSession(session: Session | null): Promise<AuthSession | null> {
    if (!session) return null
    const { data, error } = await this.client.from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle()
    if (error) throw new Error(`Could not verify administrator access: ${error.message}`)
    if (!data) return null
    const email = session.user.email ?? 'Administrator'
    const metadataName = session.user.user_metadata?.full_name
    return {
      userId: session.user.id,
      email,
      name: typeof metadataName === 'string' && metadataName.trim() ? metadataName : email.split('@')[0],
      signedInAt: session.user.last_sign_in_at ?? new Date().toISOString(),
    }
  }

  private emit() { this.listeners.forEach((listener) => listener(this.session)) }
}
