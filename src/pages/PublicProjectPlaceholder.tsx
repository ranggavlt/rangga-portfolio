import { Link, useParams } from 'react-router-dom'
import { publicSourceUrl } from '../publicSourceLinks'
import { usePortfolio } from '../repository/PortfolioProvider'

export default function PublicProjectPlaceholder() {
  const { slug } = useParams()
  const { data } = usePortfolio()
  const project = data.projects.find((item) => item.slug === slug && item.published)

  if (!project) {
    return (
      <main className="case-study-placeholder">
        <div>
          <span className="eyebrow-dot" />
          <p className="case-study-kicker">404 / Project not found</p>
          <h1>That story hasn't<br /><em>been indexed.</em></h1>
          <Link className="button button-dark" to="/">Back to portfolio</Link>
        </div>
      </main>
    )
  }

  const sourceUrl = publicSourceUrl(project)

  return (
    <main className="case-study">
      {/* Back nav */}
      <nav className="case-study-nav" aria-label="Case study navigation">
        <div className="container case-study-nav-inner">
          <Link className="case-study-back" to="/">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12H5" /><path d="m11 6-6 6 6 6" /></svg>
            Back to portfolio
          </Link>
          <span className="case-study-nav-label">{project.category} · {project.year}</span>
        </div>
      </nav>

      {/* Hero */}
      <header className="case-study-hero">
        <div className="container">
          <p className="case-study-kicker">{project.category} / {project.year}</p>
          <h1>{project.title}</h1>
          <p className="case-study-lead">{project.shortDescription}</p>
        </div>
      </header>

      {/* Meta grid */}
      <section className="case-study-meta-section" aria-label="Project details">
        <div className="container case-study-meta-grid">
          <div className="case-study-meta-item">
            <span className="case-study-meta-label">Role</span>
            <span className="case-study-meta-value">{project.role}</span>
          </div>
          <div className="case-study-meta-item">
            <span className="case-study-meta-label">Year</span>
            <span className="case-study-meta-value">{project.year}</span>
          </div>
          <div className="case-study-meta-item">
            <span className="case-study-meta-label">Category</span>
            <span className="case-study-meta-value">{project.category}</span>
          </div>
          {project.tech.length > 0 && (
            <div className="case-study-meta-item case-study-meta-tech">
              <span className="case-study-meta-label">Technologies</span>
              <div className="case-study-tech-list" role="list" aria-label="Technologies used">
                {project.tech.map((tag) => <span role="listitem" key={tag}>{tag}</span>)}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Image gallery */}
      {project.images.length > 0 && (
        <section className="case-study-gallery-section" aria-label="Project images">
          <div className="container case-study-gallery">
            {project.images.map((image, index) => (
              <figure className="case-study-figure" key={image.id}>
                <img
                  src={image.src}
                  alt={image.alt || `${project.title} — image ${index + 1}`}
                  className="case-study-img"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                {image.caption && (
                  <figcaption className="case-study-caption">
                    <span className="case-study-caption-index">0{index + 1}</span>
                    {image.caption}
                  </figcaption>
                )}
                <a className="case-study-image-link" href={image.src} target="_blank" rel="noreferrer" aria-label={`Open ${project.title} image ${index + 1} at full size`}>
                  View full-size image
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 19 19 5" /><path d="M8 5h11v11" /></svg>
                </a>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Full description */}
      {project.fullDescription && (
        <section className="case-study-body-section" aria-label="Project description">
          <div className="container case-study-body-layout">
            <div className="case-study-body-label">
              <span className="case-study-meta-label">Overview</span>
            </div>
            <div className="case-study-body-text">
              {project.fullDescription.split('\n').filter(Boolean).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA footer */}
      <footer className="case-study-footer">
        <div className="container case-study-footer-inner">
          <Link className="button button-dark" to="/">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 12H5" /><path d="m11 6-6 6 6 6" /></svg>
            Back to portfolio
          </Link>
          <div className="case-study-footer-links">
            {project.liveUrl && !project.liveUrl.includes('example.com') && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="case-study-ext-link">
                Visit live site
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 19 19 5" /><path d="M8 5h11v11" /></svg>
              </a>
            )}
            {sourceUrl && (
              <a href={sourceUrl} target="_blank" rel="noreferrer" className="case-study-ext-link">
                Source code
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 19 19 5" /><path d="M8 5h11v11" /></svg>
              </a>
            )}
          </div>
        </div>
      </footer>
    </main>
  )
}
