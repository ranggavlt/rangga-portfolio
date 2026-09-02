import { Link } from 'react-router-dom'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { AdminIcon, EmptyState, PageHeader, StatusBadge } from '../components/AdminUI'
import { useAuth } from '../../auth/AuthProvider'

function timeGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { data, repository } = usePortfolio()
  const { session } = useAuth()
  const firstName = session?.name?.split(' ')[0] ?? 'there'
  const published = data.projects.filter((project) => project.published).length
  const unread = data.messages.filter((message) => !message.read).length
  const recent = [...data.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4)
  const isLocal = repository.mode === 'local'

  return <>
    <PageHeader eyebrow="Workspace / Overview" title={`${timeGreeting()}, ${firstName}.`} description={`A compact view of the portfolio content currently held in ${isLocal ? 'the local demo repository' : 'Supabase'}.`} action={<Link className="admin-button button-dark" to="/admin/projects/new"><AdminIcon name="plus" size={14} /> New project</Link>} />
    <div className="stats-grid"><div className="stat-card"><div className="stat-label">Total projects</div><div className="stat-value">{data.projects.length}</div><div className="stat-detail">All saved projects</div></div><div className="stat-card"><div className="stat-label">Published</div><div className="stat-value">{published}</div><div className="stat-detail">Visible on the public page</div></div><div className="stat-card"><div className="stat-label">Drafts</div><div className="stat-value">{data.projects.length - published}</div><div className="stat-detail">Held back from public</div></div><div className="stat-card"><div className="stat-label">Unread messages</div><div className="stat-value">{unread}</div><div className="stat-detail">Contact-form submissions</div></div></div>
    <div className="dashboard-grid"><section className="admin-card"><div className="admin-card-header"><div><h2>Recently updated projects</h2><p>Sorted by updated timestamp.</p></div><Link className="admin-link" to="/admin/projects">View all <AdminIcon name="arrow" size={14} /></Link></div><div className="admin-card-body">{recent.length ? <ul className="recent-list">{recent.map((project) => <li key={project.id}><div><strong>{project.title}</strong><span>{project.category} · {new Date(project.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span></div><StatusBadge published={project.published} /></li>)}</ul> : <EmptyState title="No projects yet" description="Create your first piece of work to see it here." />}</div></section><section className="admin-card"><div className="admin-card-header"><div><h2>Repository status</h2><p>{isLocal ? 'Frontend-only preview mode.' : 'Connected database mode.'}</p></div></div><div className="admin-card-body"><div className="demo-callout"><strong>{isLocal ? 'Local demo mode' : 'Supabase mode'}</strong><p>{isLocal ? <>Edits save to <code>rangga-portfolio-demo-v1</code> and are shared with the public route in this browser.</> : 'Edits are persisted to Supabase and protected by database row-level security.'}</p></div><div className="demo-callout"><strong>{data.messages.length ? `${data.messages.length} message${data.messages.length === 1 ? '' : 's'} captured` : 'No messages yet'}</strong><p>Submissions from the public contact form appear in the Messages page for review.</p><Link className="admin-link" to="/admin/messages">Open messages <AdminIcon name="arrow" size={14} /></Link></div></div></section></div>
  </>
}
