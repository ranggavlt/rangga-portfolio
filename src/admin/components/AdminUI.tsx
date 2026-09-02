import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useOutlet } from 'react-router-dom'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { useAuth } from '../../auth/AuthProvider'
import './admin.css'

type ToastTone = 'success' | 'error' | 'info'
type Toast = { id: number; message: string; tone: ToastTone }

const navItems = [
  { label: 'Overview', to: '/admin', end: true },
  { label: 'Projects', to: '/admin/projects' },
  { label: 'Experience', to: '/admin/experience' },
  { label: 'Education', to: '/admin/education' },
  { label: 'Organizations', to: '/admin/organizations' },
  { label: 'Skills', to: '/admin/skills' },
  { label: 'Profile', to: '/admin/profile' },
  { label: 'Social links', to: '/admin/social-links' },
  { label: 'Messages', to: '/admin/messages' },
]

const ToastContext = createContext<{ showToast: (message: string, tone?: ToastTone) => void } | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside AdminToastProvider')
  return context
}

function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const showToast = (message: string, tone: ToastTone = 'success') => {
    const id = Date.now()
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3600)
  }
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => <div className={`toast toast-${toast.tone}`} key={toast.id}>{toast.message}</div>)}
      </div>
    </ToastContext.Provider>
  )
}

export function AdminIcon({ name, size = 17 }: { name: 'arrow' | 'chevron' | 'close' | 'menu' | 'plus' | 'edit' | 'trash' | 'search' | 'check' | 'logout' | 'reset'; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
  if (name === 'chevron') return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>
  if (name === 'close') return <svg {...common}><path d="m6 6 12 12" /><path d="m18 6-12 12" /></svg>
  if (name === 'menu') return <svg {...common}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></svg>
  if (name === 'plus') return <svg {...common}><path d="M12 5v14" /><path d="M5 12h14" /></svg>
  if (name === 'edit') return <svg {...common}><path d="m4 16-.8 4.8L8 20l11-11-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></svg>
  if (name === 'trash') return <svg {...common}><path d="M4 7h16" /><path d="M10 11v6M14 11v6" /><path d="m6 7 1 13h10l1-13M9 7V4h6v3" /></svg>
  if (name === 'search') return <svg {...common}><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4 4" /></svg>
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>
  if (name === 'logout') return <svg {...common}><path d="M10 5H5v14h5" /><path d="M13 8l4 4-4 4M8 12h9" /></svg>
  return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /><path d="M12 3v18" /></svg>
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="admin-page-header"><div><div className="admin-eyebrow">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="admin-page-action">{action}</div>}</div>
}

export function StatusBadge({ published }: { published: boolean }) {
  return <span className={`status-badge ${published ? 'status-published' : 'status-draft'}`}><span /> {published ? 'Published' : 'Draft'}</span>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="admin-empty"><div className="empty-mark">—</div><h2>{title}</h2><p>{description}</p>{action}</div>
}

export function LoadingState() { return <div className="admin-loading"><span className="loading-line" /> Loading demo data…</div> }

export function ErrorState({ message }: { message: string }) { return <div className="admin-error">{message}</div> }

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onCancel, danger = false }: { open: boolean; title: string; description: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<Element | null>(null)

  // Capture the triggering element before the dialog opens
  useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement
      // Defer so the dialog is mounted before we try to focus
      const id = window.setTimeout(() => cancelRef.current?.focus(), 0)
      return () => window.clearTimeout(id)
    } else {
      // Restore focus when dialog closes
      if (returnFocusRef.current instanceof HTMLElement) {
        returnFocusRef.current.focus()
        returnFocusRef.current = null
      }
    }
  }, [open])

  // Escape key handler
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onCancel() }
      // Focus trap — Tab cycles only between Cancel and Confirm
      if (event.key === 'Tab') {
        const first = cancelRef.current
        const last = confirmRef.current
        if (!first || !last) return
        if (event.shiftKey) {
          if (document.activeElement === first) { event.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last) { event.preventDefault(); first.focus() }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onCancel}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-eyebrow">Confirmation</div>
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        <div className="dialog-actions">
          <button ref={cancelRef} className="admin-button button-quiet" type="button" onClick={onCancel}>Cancel</button>
          <button ref={confirmRef} className={`admin-button ${danger ? 'button-danger' : 'button-dark'}`} type="button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export function AdminLayout() {
  return <AdminToastProvider><AdminLayoutInner /></AdminToastProvider>
}

function AdminLayoutInner() {
  const outlet = useOutlet()
  const location = useLocation()
  const navigate = useNavigate()
  const { session, signOut } = useAuth()
  const { repository } = usePortfolio()
  const { showToast } = useToast()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const pageTitle = navItems.find((item) => item.to === location.pathname)?.label ?? (location.pathname.includes('/projects/') ? 'Project editor' : 'Admin')

  const handleReset = () => {
    repository.reset()
    setResetOpen(false)
    showToast('Demo data reset to the seeded portfolio.', 'success')
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${drawerOpen ? 'is-open' : ''}`}>
        <div className="admin-brand"><span className="brand-mark">RA</span><div><strong>Portfolio admin</strong><span>Local demo workspace</span></div><button className="drawer-close" type="button" onClick={() => setDrawerOpen(false)} aria-label="Close admin navigation"><AdminIcon name="close" /></button></div>
        <nav className="admin-nav" aria-label="Admin navigation">
          <div className="admin-nav-label">Manage</div>
          {navItems.map((item) => <a className={location.pathname === item.to || (!item.end && location.pathname.startsWith(`${item.to}/`)) ? 'is-active' : ''} href={item.to} key={item.to} onClick={(event) => { event.preventDefault(); navigate(item.to); setDrawerOpen(false) }}>{item.label}{item.label === 'Messages' && <span className="nav-count">{repository.getMessages().filter((message) => !message.read).length || ''}</span>}</a>)}
        </nav>
        <div className="admin-sidebar-bottom"><button className="reset-demo-button" type="button" onClick={() => setResetOpen(true)}><AdminIcon name="reset" size={15} /> Reset demo data</button><div className="demo-note">LocalStorage only.<br />Not production data.</div></div>
      </aside>
      {drawerOpen && <button className="drawer-backdrop" type="button" aria-label="Close admin navigation" onClick={() => setDrawerOpen(false)} />}
      <div className="admin-main">
        <header className="admin-topbar"><button className="drawer-open" type="button" onClick={() => setDrawerOpen(true)} aria-label="Open admin navigation"><AdminIcon name="menu" /></button><div className="admin-breadcrumb"><span>Portfolio</span><AdminIcon name="chevron" size={14} /><strong>{pageTitle}</strong></div><div className="admin-user"><span className="user-avatar">{session?.name.slice(0, 1) ?? 'D'}</span><span>{session?.name ?? 'Demo editor'}</span><button type="button" onClick={() => { signOut(); navigate('/admin/login') }} aria-label="Sign out"><AdminIcon name="logout" size={16} /></button></div></header>
        <main className="admin-content">{outlet}</main>
      </div>
      <ConfirmDialog open={resetOpen} title="Reset the demo workspace?" description="This clears all local edits, messages, and temporary previews and restores the original portfolio seed." confirmLabel="Reset demo data" danger onConfirm={handleReset} onCancel={() => setResetOpen(false)} />
    </div>
  )
}
