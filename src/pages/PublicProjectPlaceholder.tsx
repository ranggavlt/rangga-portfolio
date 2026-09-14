import { Link, useParams } from 'react-router-dom'
import { usePortfolio } from '../repository/PortfolioProvider'

export default function PublicProjectPlaceholder() {
  const { slug } = useParams()
  const { data } = usePortfolio()
  const project = data.projects.find((item) => item.slug === slug && item.published)
  if (!project) return <main className="case-study-placeholder"><div><span className="eyebrow-dot" /><p className="case-study-kicker">404 / Project not found</p><h1>That story hasn’t<br /><em>been indexed.</em></h1><Link className="button button-dark" to="/">Back to portfolio</Link></div></main>
  return <main className="case-study-placeholder"><div><span className="eyebrow-dot" /><p className="case-study-kicker">Project / {project.year}</p><h1>{project.title}</h1><p>{project.fullDescription}</p><div className="case-study-note">{project.category} · {project.role}{project.tech.length ? ` · ${project.tech.join(', ')}` : ''}</div><Link className="button button-dark" to="/">Back to portfolio</Link></div></main>
}
