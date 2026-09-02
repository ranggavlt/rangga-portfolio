import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { AdminIcon, ConfirmDialog, EmptyState, PageHeader, StatusBadge, useToast } from '../components/AdminUI'

export default function ProjectsPage() {
  const { data, repository } = usePortfolio()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [sort, setSort] = useState<'order' | 'year' | 'updated'>('order')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const projects = useMemo(() => data.projects.filter((project) => {
    const matchesQuery = `${project.title} ${project.category} ${project.slug}`.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = status === 'all' || (status === 'published' ? project.published : !project.published)
    return matchesQuery && matchesStatus
  }).sort((a, b) => sort === 'year' ? b.year.localeCompare(a.year) : sort === 'updated' ? b.updatedAt.localeCompare(a.updatedAt) : a.displayOrder - b.displayOrder), [data.projects, query, sort, status])

  const handleDelete = async () => {
    if (!deleteId) return
    await repository.deleteProject(deleteId)
    setDeleteId(null)
    showToast('Project deleted from the local demo.', 'info')
  }

  return <>
    <PageHeader eyebrow="Content / Projects" title="Projects" description="Maintain the public work index and the three-image gallery that powers each project story." action={<Link className="admin-button button-dark" to="/admin/projects/new"><AdminIcon name="plus" size={14} /> Create project</Link>} />
    <div className="table-toolbar"><div className="admin-eyebrow">{projects.length} result{projects.length === 1 ? '' : 's'}</div><div className="toolbar-filters"><div className="search-field"><AdminIcon name="search" size={15} /><input className="admin-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects" aria-label="Search projects" /></div><select className="admin-select" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} aria-label="Filter project status"><option value="all">All status</option><option value="published">Published</option><option value="draft">Draft</option></select><select className="admin-select" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Sort projects"><option value="order">Display order</option><option value="year">Year</option><option value="updated">Last updated</option></select></div></div>
    {projects.length === 0 ? <EmptyState title="No projects found" description="Try a different search or create the first project in this local workspace." action={<Link className="admin-button button-dark" to="/admin/projects/new">Create project</Link>} /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Project</th><th>Category</th><th>Year</th><th>Status</th><th>Order</th><th>Updated</th><th><span className="visually-hidden">Actions</span></th></tr></thead><tbody>{projects.map((project) => <tr key={project.id}><td><div className="table-project"><div className="table-thumb"><img src={project.images[0].src} alt="" /></div><div><strong>{project.title}</strong><span>/{project.slug}</span></div></div></td><td className="muted-cell">{project.category}</td><td>{project.year}</td><td><StatusBadge published={project.published} /></td><td>{project.displayOrder}</td><td className="muted-cell">{new Date(project.updatedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</td><td><div className="table-actions"><button className="table-icon-button" type="button" onClick={() => navigate(`/admin/projects/${project.id}/edit`)} aria-label={`Edit ${project.title}`}><AdminIcon name="edit" size={14} /></button><button className="table-icon-button danger" type="button" onClick={() => setDeleteId(project.id)} aria-label={`Delete ${project.title}`}><AdminIcon name="trash" size={14} /></button></div></td></tr>)}</tbody></table></div>}
    <div className="mobile-project-cards">{projects.map((project) => <article className="admin-card mobile-project-card" key={project.id}><div className="table-project"><div className="table-thumb"><img src={project.images[0].src} alt="" /></div><div><strong>{project.title}</strong><span>{project.category} · {project.year}</span></div></div><div><StatusBadge published={project.published} /><span className="muted-cell">Order {project.displayOrder}</span></div><div className="table-actions"><button className="admin-button button-quiet" type="button" onClick={() => navigate(`/admin/projects/${project.id}/edit`)}>Edit</button><button className="admin-button button-quiet" type="button" onClick={() => setDeleteId(project.id)}>Delete</button></div></article>)}</div>
    <ConfirmDialog open={Boolean(deleteId)} title="Delete this project?" description="The project will be removed from the local demo repository. This cannot be undone unless you reset the demo data." confirmLabel="Delete project" danger onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
  </>
}
