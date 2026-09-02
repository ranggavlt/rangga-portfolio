import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PortfolioProject, ProjectImage } from '../../domain/types'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { AdminIcon, PageHeader, useToast } from '../components/AdminUI'
import { AdminField, TagsInput, TextArea, TextInput, Toggle } from '../components/FormControls'

const placeholderImages = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=82',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=82',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=82',
]

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const imageFor = (projectId: string, position: 1 | 2 | 3): ProjectImage => ({ id: `${projectId}-image-${position}`, src: placeholderImages[position - 1], alt: '', caption: '', position })

const createProject = (): PortfolioProject => ({
  id: `project-${Date.now()}`,
  slug: '',
  title: '',
  year: new Date().getFullYear().toString(),
  category: '',
  shortDescription: '',
  fullDescription: '',
  role: '',
  tech: [],
  liveUrl: '',
  sourceUrl: '',
  published: false,
  displayOrder: 1,
  updatedAt: new Date().toISOString(),
  images: [imageFor(`project-${Date.now()}`, 1), imageFor(`project-${Date.now()}`, 2), imageFor(`project-${Date.now()}`, 3)],
})

export default function ProjectFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { repository } = usePortfolio()
  const { showToast } = useToast()
  const existing = id ? repository.getProject(id) : undefined
  const [project, setProject] = useState<PortfolioProject>(() => existing ? structuredClone(existing) : createProject())
  const [previewUrls, setPreviewUrls] = useState<Record<number, string>>({})
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id && !existing) navigate('/admin/projects', { replace: true })
  }, [existing, id, navigate])

  const isNew = !id
  const title = useMemo(() => isNew ? 'Create project' : 'Edit project', [isNew])
  const update = (field: keyof PortfolioProject, value: PortfolioProject[keyof PortfolioProject]) => setProject((current) => ({ ...current, [field]: value }))
  const updateImage = (position: 1 | 2 | 3, field: keyof ProjectImage, value: string) => setProject((current) => ({ ...current, images: current.images.map((image) => image.position === position ? { ...image, [field]: value } : image) as PortfolioProject['images'] }))

  // Revoke all remaining blob URLs when the form unmounts
  useEffect(() => {
    return () => {
      setPreviewUrls((current) => {
        Object.values(current).forEach((url) => URL.revokeObjectURL(url))
        return {}
      })
    }
  }, [])

  const handleFile = (position: 1 | 2 | 3, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPreviewUrls((current) => {
      // Revoke the previous blob URL for this slot before creating a new one
      if (current[position]) URL.revokeObjectURL(current[position])
      return { ...current, [position]: URL.createObjectURL(file) }
    })
  }

  const resetPreview = (position: 1 | 2 | 3) => setPreviewUrls((current) => {
    if (current[position]) URL.revokeObjectURL(current[position])
    const next = { ...current }
    delete next[position]
    return next
  })

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextErrors: string[] = []
    if (!project.title.trim()) nextErrors.push('Title is required.')
    if (!project.slug.trim()) nextErrors.push('Slug is required.')
    if (!project.category.trim()) nextErrors.push('Category is required.')
    if (!project.shortDescription.trim()) nextErrors.push('Short description is required.')
    project.images.forEach((image, index) => {
      if (!image.src.trim() || !image.alt.trim() || !image.caption.trim()) nextErrors.push(`Gallery image ${index + 1} needs a URL, alt text, and caption.`)
    })
    // Slug uniqueness — check no other project already uses this slug
    const finalSlug = slugify(project.slug || project.title)
    const slugConflict = repository.getProjects().some(
      (p) => slugify(p.slug) === finalSlug && p.id !== project.id
    )
    if (slugConflict) nextErrors.push(`The slug "${finalSlug}" is already used by another project. Choose a different slug.`)
    setErrors(nextErrors)
    if (nextErrors.length) return
    setSaving(true)
    window.setTimeout(() => {
      repository.saveProject({ ...project, slug: finalSlug, updatedAt: new Date().toISOString() })
      setSaving(false)
      showToast(isNew ? 'Project created in the local demo.' : 'Project changes saved locally.')
      navigate('/admin/projects')
    }, 400)
  }

  return <>
    <PageHeader eyebrow="Projects / Editor" title={title} description="Keep the public project story and its three-image signature gallery in one place." />
    <form className="admin-form" onSubmit={handleSubmit}>
      {errors.length > 0 && <div className="admin-error" role="alert">{errors.map((error) => <div key={error}>{error}</div>)}</div>}
      <div className="editor-layout">
        <div className="admin-card">
          <div className="admin-card-body">
            <section className="form-section"><h2 className="form-section-title">Project details</h2><div className="form-grid">
              <AdminField label="Title"><TextInput value={project.title} onChange={(event) => update('title', event.target.value)} placeholder="Northstar / Billing OS" /></AdminField>
              <AdminField label="Slug" hint="Used for the future /projects/:slug case study route."><TextInput value={project.slug} onChange={(event) => update('slug', slugify(event.target.value))} placeholder="northstar-billing-os" /></AdminField>
              <AdminField label="Year"><TextInput value={project.year} onChange={(event) => update('year', event.target.value)} placeholder="2024" /></AdminField>
              <AdminField label="Category"><TextInput value={project.category} onChange={(event) => update('category', event.target.value)} placeholder="Product systems" /></AdminField>
              <AdminField label="Role"><TextInput value={project.role} onChange={(event) => update('role', event.target.value)} placeholder="Lead engineer · Product partner" /></AdminField>
              <AdminField label="Display order"><TextInput type="number" min="1" value={project.displayOrder} onChange={(event) => update('displayOrder', Number(event.target.value))} /></AdminField>
            </div></section>
            <section className="form-section"><h2 className="form-section-title">Story and links</h2><div className="admin-form">
              <AdminField label="Short description"><TextArea rows={3} value={project.shortDescription} onChange={(event) => update('shortDescription', event.target.value)} placeholder="A short public description." /></AdminField>
              <AdminField label="Full description"><TextArea rows={6} value={project.fullDescription} onChange={(event) => update('fullDescription', event.target.value)} placeholder="The longer case-study-ready project story." /></AdminField>
              <div className="form-grid"><AdminField label="Live website URL"><TextInput type="url" value={project.liveUrl} onChange={(event) => update('liveUrl', event.target.value)} placeholder="https://example.com" /></AdminField><AdminField label="Source-code URL"><TextInput type="url" value={project.sourceUrl} onChange={(event) => update('sourceUrl', event.target.value)} placeholder="https://github.com/..." /></AdminField></div>
              <AdminField label="Technology tags" hint="Press Enter or type a comma to add a tag."><TagsInput value={project.tech} onChange={(value) => update('tech', value)} /></AdminField>
            </div></section>
            <section className="form-section"><h2 className="form-section-title">Exactly three gallery images</h2><p className="admin-field"><small>Local-file selection creates a temporary browser preview only. It never stores image binary or Base64 in localStorage; Supabase Storage will replace this later.</small></p><div className="image-editor-grid">
              {project.images.map((image) => <div className="image-editor-card" key={image.position}><div className="image-preview"><img src={previewUrls[image.position] ?? image.src} alt={image.alt || `Gallery image ${image.position} preview`} /><span>0{image.position}</span></div><div className="image-editor-body"><AdminField label="Image URL"><TextInput value={image.src} onChange={(event) => updateImage(image.position, 'src', event.target.value)} placeholder="https://..." /></AdminField><AdminField label="Alt text"><TextInput value={image.alt} onChange={(event) => updateImage(image.position, 'alt', event.target.value)} placeholder="Describe the image" /></AdminField><AdminField label="Caption"><TextInput value={image.caption} onChange={(event) => updateImage(image.position, 'caption', event.target.value)} placeholder="A unique caption" /></AdminField><label className="admin-button button-quiet" htmlFor={`file-${image.position}`}><AdminIcon name="arrow" size={14} /> Replace<input id={`file-${image.position}`} className="file-input" type="file" accept="image/*" onChange={(event) => handleFile(image.position, event)} /></label><button className="admin-button button-quiet" type="button" onClick={() => resetPreview(image.position)}>Reset preview</button></div></div>)}
            </div></section>
          </div>
        </div>
        <aside className="editor-side"><div className="editor-side-card"><h2>Publishing</h2><Toggle label="Visible on public page" checked={project.published} onChange={(value) => update('published', value)} /><p style={{ marginTop: 12 }}>Drafts stay available in the admin list but are hidden from the public portfolio.</p></div><div className="editor-side-card"><h2>Demo note</h2><p>Changes are persisted in the <code>rangga-portfolio-demo-v1</code> local repository only.</p></div></aside>
      </div>
      <div className="form-actions"><div className="form-feedback">{saving ? 'Saving locally…' : ''}</div><button type="button" className="admin-button button-quiet" onClick={() => navigate('/admin/projects')}>Cancel</button><button type="submit" className="admin-button button-dark" disabled={saving}>{saving ? 'Saving' : 'Save project'} <AdminIcon name="arrow" size={14} /></button></div>
    </form>
  </>
}
