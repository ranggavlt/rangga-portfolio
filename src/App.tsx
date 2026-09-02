import { FormEvent, CSSProperties, PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PortfolioProject } from './domain/types'
import { usePortfolio } from './repository/PortfolioProvider'
import './styles.css'

type IconName = 'arrow-up-right' | 'arrow-right' | 'arrow-left' | 'arrow-down' | 'plus' | 'menu' | 'close' | 'mail' | 'check' | 'external'

type RevealProps = {
  children: React.ReactNode
  className?: string
  delay?: number
}

const navLinks = [
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
]

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  switch (name) {
    case 'arrow-up-right':
      return <svg {...common}><path d="M5 19 19 5" /><path d="M8 5h11v11" /></svg>
    case 'arrow-right':
      return <svg {...common}><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg>
    case 'arrow-left':
      return <svg {...common}><path d="M20 12H5" /><path d="m11 6-6 6 6 6" /></svg>
    case 'arrow-down':
      return <svg {...common}><path d="M12 4v15" /><path d="m6 13 6 6 6-6" /></svg>
    case 'plus':
      return <svg {...common}><path d="M12 5v14" /><path d="M5 12h14" /></svg>
    case 'menu':
      return <svg {...common}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></svg>
    case 'close':
      return <svg {...common}><path d="m6 6 12 12" /><path d="m18 6-12 12" /></svg>
    case 'mail':
      return <svg {...common}><rect x="3.5" y="5" width="17" height="14" rx="1" /><path d="m4 7 8 6 8-6" /></svg>
    case 'check':
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>
    case 'external':
      return <svg {...common}><path d="M14 5h5v5" /><path d="M19 5 11 13" /><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>
  }
}

function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.14 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}

function SectionLabel({ number, label, detail }: { number: string; label: string; detail?: string }) {
  return (
    <div className="section-label">
      <span className="section-number">{number}</span>
      <span className="section-label-name">{label}</span>
      {detail && <span className="section-label-detail">{detail}</span>}
    </div>
  )
}

function ProjectGallery({ project }: { project: PortfolioProject }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const dragged = useRef(false)

  const goNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % project.images.length)
  }, [project.images.length])

  const goPrevious = useCallback(() => {
    setActiveIndex((current) => (current - 1 + project.images.length) % project.images.length)
  }, [project.images.length])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    setDragStart(event.clientX)
    dragged.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart !== null && Math.abs(event.clientX - dragStart) > 12) {
      dragged.current = true
    }
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart === null) return
    const distance = event.clientX - dragStart
    setDragStart(null)
    if (Math.abs(distance) > 46) {
      distance < 0 ? goNext() : goPrevious()
      return
    }
    if (!dragged.current) goNext()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      goNext()
    }
    if (event.key === 'ArrowLeft') goPrevious()
    if (event.key === 'ArrowRight') goNext()
  }

  return (
    <div className="gallery-wrap" role="region" aria-roledescription="carousel" aria-label={`${project.title} project images`}>
      <div className="gallery-stage">
        {project.images.map((image, index) => {
          const offset = (index - activeIndex + project.images.length) % project.images.length
          return (
            <div
              className={`project-image-card card-offset-${offset}`}
              key={image.src}
              role={offset === 0 ? 'button' : undefined}
              tabIndex={offset === 0 ? 0 : -1}
              aria-label={offset === 0 ? 'Show next project image' : undefined}
              onPointerDown={offset === 0 ? handlePointerDown : undefined}
              onPointerMove={offset === 0 ? handlePointerMove : undefined}
              onPointerUp={offset === 0 ? handlePointerUp : undefined}
              onPointerCancel={offset === 0 ? () => setDragStart(null) : undefined}
              onKeyDown={offset === 0 ? handleKeyDown : undefined}
            >
              <img src={image.src} alt={`${project.title}: ${image.alt}`} draggable="false" />
              {offset === 0 && <span className="image-index">0{index + 1}</span>}
            </div>
          )
        })}
        <div className="gallery-grain" aria-hidden="true" />
      </div>
      <div className="gallery-meta">
        <div className="gallery-caption" key={`${project.id}-${activeIndex}`}>
          <span className="caption-kicker">Image {String(activeIndex + 1).padStart(2, '0')}</span>
          <span>{project.images[activeIndex].caption}</span>
        </div>
        <div className="gallery-controls">
          <span className="gallery-count" aria-live="polite">{String(activeIndex + 1).padStart(2, '0')} <i>/</i> 03</span>
          <button type="button" className="icon-button" onClick={goPrevious} aria-label="Previous project image"><Icon name="arrow-left" size={17} /></button>
          <button type="button" className="icon-button" onClick={goNext} aria-label="Next project image"><Icon name="arrow-right" size={17} /></button>
        </div>
      </div>
    </div>
  )
}

function ProjectsSection() {
  const { data } = usePortfolio()
  const visibleProjects = data.projects.filter((project) => project.published).sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <section className="section work-section" id="work">
      <div className="container">
        <Reveal className="section-heading-row">
          <SectionLabel number="01" label="Selected projects" detail="A few things made with care" />
          <p className="section-intro">The best work sits somewhere between a sharp idea and a dependable system.</p>
        </Reveal>

        <div className="projects-list">
          {visibleProjects.map((project, index) => (
            <article className="project-row" key={project.id}>
              <div className="project-gallery-column">
                <ProjectGallery project={project} />
              </div>
              <div className="project-copy">
                <Reveal delay={index * 90}>
                  <div className="project-overline">
                    <span>{project.year}</span>
                    <span>{project.category}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p className="project-description">{project.shortDescription}</p>
                  <div className="project-role">
                    <span className="mini-label">Role</span>
                    <span>{project.role}</span>
                  </div>
                  <div className="tech-list" role="list" aria-label="Technologies used">
                    {project.tech.map((tag) => <span role="listitem" key={tag}>{tag}</span>)}
                  </div>
                  <div className="project-links">
                    <a href={project.liveUrl} target="_blank" rel="noreferrer">Visit live site <Icon name="arrow-up-right" size={16} /></a>
                    <a href={project.sourceUrl} target="_blank" rel="noreferrer">Source code <Icon name="arrow-up-right" size={16} /></a>
                    <Link to={`/projects/${project.slug}`}>View case study <Icon name="arrow-right" size={16} /></Link>
                  </div>
                </Reveal>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ExperienceSection() {
  const { data } = usePortfolio()

  return (
    <section className="section experience-section" id="experience">
      <div className="container">
        <Reveal className="section-heading-row compact-heading">
          <SectionLabel number="02" label="Work experience" detail="The places and people" />
          <p className="section-intro">I like working close to the problem — and close enough to the people using what we make.</p>
        </Reveal>
        <div className="experience-list">
          {data.experience.filter((item) => item.published).sort((a, b) => a.displayOrder - b.displayOrder).map((item, index) => (
            <Reveal key={item.company} delay={index * 70} className="experience-row">
              <div className="experience-period">{item.period}</div>
              <div className="experience-company">{item.company}</div>
              <div className="experience-detail">
                <h3>{item.role}</h3>
                <p>{item.description}</p>
              </div>
              <span className="row-arrow"><Icon name="arrow-up-right" size={18} /></span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function EducationSection() {
  const { data } = usePortfolio()
  const [lineVisible, setLineVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setLineVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.22 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="section education-section" id="education">
      <div className="container education-layout">
        <Reveal className="education-intro">
          <SectionLabel number="03" label="Education" detail="Always in progress" />
          <p className="large-statement">A practical education, built in public and kept deliberately unfinished.</p>
        </Reveal>
        <div className={`timeline ${lineVisible ? 'line-visible' : ''}`} ref={ref}>
          <div className="timeline-rule" aria-hidden="true"><span /></div>
          {[...data.education].sort((a, b) => a.displayOrder - b.displayOrder).map((item, index) => (
            <Reveal className="timeline-item" delay={index * 80} key={`${item.institution}-${item.period}`}>
              <div className="timeline-dot" aria-hidden="true" />
              <div className="timeline-period">{item.period}</div>
              <div>
                <h3>{item.institution}</h3>
                <p className="timeline-degree">{item.degree}</p>
                <p>{item.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function OrganizationsSection() {
  const { data } = usePortfolio()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="section organizations-section" id="organizations">
      <div className="container">
        <Reveal className="section-heading-row compact-heading">
          <SectionLabel number="04" label="Organizations" detail="Rooms for exchange" />
          <p className="section-intro">The work gets better when the room stays curious.</p>
        </Reveal>
        <div className="organization-list">
          {data.organizations.filter((organization) => organization.published).sort((a, b) => a.displayOrder - b.displayOrder).map((organization, index) => {
            const isOpen = openIndex === index
            return (
              <Reveal key={organization.name} delay={index * 70}>
                <div className={`organization-card ${isOpen ? 'is-open' : ''}`}>
                  <button type="button" className="organization-trigger" onClick={() => setOpenIndex(isOpen ? null : index)} aria-expanded={isOpen}>
                    <span className="organization-name">{organization.name}</span>
                    <span className="organization-meta">{organization.meta}</span>
                    <span className="plus-icon"><Icon name="plus" size={18} /></span>
                  </button>
                  <div className="organization-detail" aria-hidden={!isOpen}>
                    <p>{organization.detail}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  const { data } = usePortfolio()
  const { profile } = data

  return (
    <section className="section about-section" id="about">
      <div className="container about-layout">
        <Reveal className="portrait-wrap">
          <div className="portrait-frame">
            <img src={profile.portraitUrl} alt={`${profile.fullName} grayscale portrait`} />
            <span className="portrait-note">Portrait / study 01</span>
          </div>
        </Reveal>
        <div className="about-copy">
          <Reveal>
            <SectionLabel number="05" label="About" detail="The person behind the interface" />
            <h2>{profile.aboutHeading.split(' ').slice(0, -1).join(' ')}<br /><em>{profile.aboutHeading.split(' ').slice(-1)}</em></h2>
            <p className="about-lede">{profile.aboutBiography}</p>
            <p className="about-body">{profile.aboutSecondary}</p>
            <a className="text-link" href={`mailto:${profile.email}`}>Say hello <Icon name="arrow-up-right" size={16} /></a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function SkillsSection() {
  const { data } = usePortfolio()

  return (
    <section className="section skills-section" id="skills">
      <div className="container">
        <Reveal className="section-heading-row compact-heading">
          <SectionLabel number="06" label="Skills & expertise" detail="Tools for useful work" />
          <p className="section-intro">A wide enough lens to see the whole system, a close enough eye to care about the details.</p>
        </Reveal>
        <div className="skills-grid">
          {[...data.skills].sort((a, b) => a.displayOrder - b.displayOrder).map((group, index) => (
            <Reveal className="skill-group" delay={index * 80} key={group.label}>
              <div className="skill-group-top"><span>0{index + 1}</span><h3>{group.label}</h3></div>
              <ul>{group.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  const { data, repository } = usePortfolio()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('error')
      setErrorMessage('Please fill in all three fields before sending.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setStatus('error')
      setErrorMessage('That email address looks a little off. Check it and try again.')
      return
    }
    setStatus('loading')
    setErrorMessage('')
    window.setTimeout(() => {
      repository.addMessage({
        id: `message-${Date.now()}`,
        sender: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        submittedAt: new Date().toISOString(),
        read: false,
      })
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    }, 850)
  }

  return (
    <section className="section contact-section" id="contact">
      <div className="container contact-layout">
        <Reveal className="contact-intro">
          <SectionLabel number="07" label="Contact" detail="Let’s make something clear" />
          <h2>Have a good<br /><em>question?</em></h2>
          <p>Tell me a little about what you’re working on, where it’s stuck, or what you’d like to explore.</p>
          <a className="email-link" href={`mailto:${data.profile.email}`}><Icon name="mail" size={17} /> {data.profile.email}</a>
        </Reveal>
        <Reveal className="contact-form-wrap" delay={120}>
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="field-row">
              <label htmlFor="name">Your name <span>*</span></label>
              <input id="name" name="name" type="text" placeholder="Jane Smith" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} aria-invalid={status === 'error' && !form.name} />
            </div>
            <div className="field-row">
              <label htmlFor="email">Email address <span>*</span></label>
              <input id="email" name="email" type="email" placeholder="jane@company.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} aria-invalid={status === 'error' && !!form.email && !/^\S+@\S+\.\S+$/.test(form.email)} />
            </div>
            <div className="field-row">
              <label htmlFor="message">A few words <span>*</span></label>
              <textarea id="message" name="message" rows={4} placeholder="What are you making?" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} aria-invalid={status === 'error' && !form.message} />
            </div>
            <div className="form-footer">
              <div className={`form-feedback ${status}`} role="status" aria-live="polite">
                {status === 'success' && <><Icon name="check" size={16} /> Thanks — I’ll be in touch.</>}
                {status === 'error' && errorMessage}
                {status === 'loading' && 'Sending a little signal…'}
              </div>
              <button className="submit-button" type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending' : 'Send message'}
                <Icon name="arrow-up-right" size={17} />
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  )
}

function App() {
  const { data } = usePortfolio()
  const { profile } = data
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const sectionIds = ['home', 'work', 'experience', 'education', 'organizations', 'about', 'skills', 'contact']
    const updateScrollState = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0)
      let current = 'home'
      sectionIds.forEach((id) => {
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top <= 170) current = id
      })
      setActiveSection(current)
    }
    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      window.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [])

  const navigate = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const backToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); navigate('home') }} aria-label="Rangga Ariansyah home">
            <span className="brand-mark">RA</span>
            <span className="brand-name">Rangga Ariansyah</span>
          </a>
          <nav id="primary-navigation" className={`desktop-nav ${menuOpen ? 'mobile-open' : ''}`} aria-label="Primary navigation">
            {navLinks.map((link) => <a key={link.id} className={activeSection === link.id || (link.id === 'about' && (activeSection === 'skills' || activeSection === 'organizations')) ? 'is-active' : ''} href={`#${link.id}`} onClick={(event) => { event.preventDefault(); navigate(link.id) }}>{link.label}</a>)}
          </nav>
          <div className="header-action">
            <a className="header-availability" href={`mailto:${profile.email}`}><span /> {profile.availabilityText}</a>
            <button className="mobile-menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="primary-navigation" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}>
              <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
            </button>
          </div>
        </div>
        <div className="scroll-progress" style={{ width: `${scrollProgress * 100}%` }} aria-hidden="true" />
      </header>

      <main id="main">
        <section className="hero section" id="home">
          <div className="container hero-grid">
            <div className="hero-copy">
              <Reveal className="eyebrow"><span className="eyebrow-dot" /> {profile.heroEyebrow}</Reveal>
              <Reveal delay={90}><h1>{profile.heroHeading.split(' ').slice(0, 2).join(' ')}<br /><em>{profile.heroHeading.split(' ').slice(2).join(' ')}</em></h1></Reveal>
              <Reveal delay={180}><p className="hero-description">{profile.heroDescription}</p></Reveal>
              <Reveal delay={270} className="hero-actions">
                <button className="button button-dark" type="button" onClick={() => navigate('work')}>Explore selected work <Icon name="arrow-down" size={16} /></button>
                <a className="button button-quiet" href="mailto:hello@rangga.dev">Start a conversation <Icon name="arrow-up-right" size={16} /></a>
              </Reveal>
            </div>
            <Reveal delay={220} className="hero-aside">
              <div className="hero-aside-line" />
              <div className="hero-aside-content">
                <span className="mini-label">What I do</span>
                <p>{profile.professionalTitle}<br />for the open web.</p>
                <span className="hero-aside-index">01 <i>—</i> 07</span>
              </div>
            </Reveal>
          </div>
          <div className="container hero-bottom">
            <span>Scroll to explore</span>
            <div className="hero-scroll-line"><span /></div>
            <span>{profile.location}</span>
          </div>
        </section>

        <ProjectsSection />
        <ExperienceSection />
        <EducationSection />
        <OrganizationsSection />
        <AboutSection />
        <SkillsSection />
        <ContactSection />
      </main>

      <footer className="site-footer">
        <div className="container footer-top">
          <div className="footer-mark"><span className="brand-mark">RA</span><span>Rangga Ariansyah</span></div>
          <div className="footer-links">
            {data.socialLinks.filter((link) => link.enabled).sort((a, b) => a.displayOrder - b.displayOrder).map((link) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer">{link.platform} <Icon name="arrow-up-right" size={14} /></a>)}
            <a href={`mailto:${profile.email}`}>Email <Icon name="arrow-up-right" size={14} /></a>
          </div>
          <button className="back-top" type="button" onClick={backToTop}>Back to top <Icon name="arrow-up-right" size={15} /></button>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} {profile.fullName}</span><span>{profile.footerText}</span><span>{profile.professionalTitle}</span></div>
      </footer>
    </div>
  )
}

export default App
