import { FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider'
import { AdminField, TextInput } from '../components/FormControls'
import { AdminIcon } from '../components/AdminUI'

export default function LoginPage() {
  const { session, loading, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@rangga.dev')
  const [password, setPassword] = useState('demo')
  const [error, setError] = useState('')

  useEffect(() => { if (session) navigate('/admin', { replace: true }) }, [navigate, session])
  if (session) return <Navigate to="/admin" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try { await signIn(email, password) } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in to the demo workspace.') }
  }

  return <main className="login-screen"><section className="login-card"><div className="login-brand"><span className="brand-mark">RA</span><div><strong>Portfolio admin</strong><span>Rangga Ariansyah</span></div></div><div className="admin-eyebrow">Frontend preview / Demo login</div><h1>Welcome back.</h1><p>This is a local-only admin prototype. It is not production authentication and does not connect to Supabase.</p>{error && <div className="admin-error" role="alert">{error}</div>}<form className="login-form" onSubmit={submit}><AdminField label="Email"><TextInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" /></AdminField><AdminField label="Password"><TextInput type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></AdminField><button className="admin-button button-dark" type="submit" disabled={loading}>{loading ? 'Checking demo session…' : 'Enter demo workspace'} <AdminIcon name="arrow" size={14} /></button></form><div className="demo-credentials"><strong>Demo credentials</strong><br />Email: demo@rangga.dev<br />Password: demo</div><p className="login-disclaimer">The demo session is stored locally so a future Supabase Auth adapter can replace it without changing the admin page contract.</p><Link className="admin-link" to="/">← Back to public portfolio</Link></section></main>
}
