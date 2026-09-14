import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PortfolioProject, ProjectImage } from '../../domain/types'
import { mediaService, validateProjectImage } from '../../media/mediaService'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { isHttpUrl } from '../lib/validation'
import { AdminIcon, PageHeader, useToast } from '../components/AdminUI'
import { AdminField, TagsInput, TextArea, TextInput, Toggle } from '../components/FormControls'

type ImagePosition = 1 | 2 | 3

const placeholderImages = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=82',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=82',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=82',
]

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const imageFor = (projectId: string, position: ImagePosition): ProjectImage => ({ id: `${projectId}-image-${position}`, src: placeholderImages[position - 1], storagePath: null, alt: '', caption: '', position })

const createProject = (): PortfolioProject => {
  const id = `project-${Date.now()}`
  return {
    id,
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
    images: [imageFor(id, 1), imageFor(id, 2), imageFor(id, 3)],
  }
}

export default function ProjectFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { repository } = usePortfolio()
  const { showToast } = useToast()
  const existing = id ? repository.getProject(id) : undefined
  const [project, setProject] = useState<PortfolioProject>(() => existing ? structuredClone(existing) : createProject())
  const [pendingFiles, setPendingFiles] = useState<Partial<Record<ImagePosition, File>>>({})
  const [previewUrls, setPreviewUrls] = useState<Partial<Record<ImagePosition, string>>>({})
  const previewUrlsRef = useRef<Partial<Record<ImagePosition, string>>>({})
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (id && !existing) navigate('/admin/projects', { replace: true })
  }, [existing, id, navigate])

  useEffect(() => () => {
    Object.values(previewUrlsRef.current).forEach((url) => { if (url) URL.revokeObjectURL(url) })
  }, [])

  const isNew = !id
  const title = useMemo(() => isNew ? 'Create project' : 'Edit project', [isNew])
  const update = (field: keyof PortfolioProject, value: PortfolioProject[keyof PortfolioProject]) => setProject((current) => ({ ...current, [field]: value }))
  const updateImage = (position: ImagePosition, field: 'src' | 'alt' | 'caption', value: string) => setProject((current) => ({
    ...current,
    images: current.images.map((image) => image.position === position
      ? { ...image, [field]: value, ...(field === 'src' ? { storagePath: null } : {}) }
      : image) as PortfolioProject['images'],
  }))

  const revokePreview = (position: ImagePosition) => {
    const url = previewUrlsRef.current[position]
    if (url) URL.revokeObjectURL(url)
    delete previewUrlsRef.current[position]
    setPreviewUrls((current) => { const next = { ...current }; delete next[position]; return next })
  }

  const clearPendingMedia = () => {
    ;([1, 2, 3] as ImagePosition[]).forEach(revokePreview)
    setPendingFiles({})
  }

  const handleFile = async (position: ImagePosition, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      await validateProjectImage(file)
      revokePreview(position)
      const previewUrl = URL.createObjectURL(file)
      previewUrlsRef.current[position] = previewUrl
      setPreviewUrls((current) => ({ ...current, [position]: previewUrl }))
      setPendingFiles((current) => ({ ...current, [position]: file }))
      setErrors([])
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'The selected image is not valid.'])
    }
  }

  const resetPreview = (position: ImagePosition) => {
    revokePreview(position)
    setPendingFiles((current) => { const next = { ...current }; delete next[position]; return next })
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (saving) return
    const nextErrors: string[] = []
    const finalSlug = slugify(project.slug || project.title)
    if (!project.title.trim()) nextErrors.push('Title is required.')
    if (!finalSlug) nextErrors.push('Slug is required.')
    if (!project.year.trim()) nextErrors.push('Year is required.')
    if (!project.category.trim()) nextErrors.push('Category is required.')
    if (!project.shortDescription.trim()) nextErrors.push('Short description is required.')
    if (!project.fullDescription.trim()) nextErrors.push('Full description is required.')
    if (!project.role.trim()) nextErrors.push('Role is required.')
    if (!Number.isFinite(project.displayOrder) || project.displayOrder < 1) nextErrors.push('Display order must be 1 or greater.')
    if (!isHttpUrl(project.liveUrl)) nextErrors.push('Live website URL must start with http:// or https://.')
    if (!isHttpUrl(project.sourceUrl)) nextErrors.push('Source-code URL must start with http:// or https://.')
    if (project.images.length !== 3) nextErrors.push('Each project must have exactly three gallery images.')
    project.images.forEach((image, index) => {
      if ((!image.src.trim() && !pendingFiles[image.position]) || !image.alt.trim() || !image.caption.trim()) nextErrors.push(`Gallery image ${index + 1} needs an image, alt text, and caption.`)
      if (!pendingFiles[image.position] && image.src.trim() && !isHttpUrl(image.src, false)) nextErrors.push(`Gallery image ${index + 1} URL must start with http:// or https://.`)
    })
    for (const file of Object.values(pendingFiles)) {
      if (!file) continue
      try { await validateProjectImage(file) }
      catch (error) { nextErrors.push(error instanceof Error ? error.message : 'A selected image is not valid.') }
    }
    const slugConflict = repository.getProjects().some((item) => slugify(item.slug) === finalSlug && item.id !== project.id)
    if (slugConflict) nextErrors.push(`The slug "${finalSlug}" is already used by another project. Choose a different slug.`)
    setErrors(nextErrors)
    if (nextErrors.length) return

    setSaving(true)
    const uploadedPaths: string[] = []
    let databaseSaved = false
    try {
      let images = project.images.map((image) => ({ ...image })) as PortfolioProject['images']
      if (repository.mode === 'supabase') {
        if (!mediaService) throw new Error('Supabase Storage is not configured.')
        for (const position of [1, 2, 3] as ImagePosition[]) {
          const file = pendingFiles[position]
          if (!file) continue
          const uploaded = await mediaService.uploadProjectImage(file, finalSlug, position)
          uploadedPaths.push(uploaded.storagePath)
          images = images.map((image) => image.position === position ? { ...image, src: uploaded.publicUrl, storagePath: uploaded.storagePath } : image) as PortfolioProject['images']
        }
      }

      const savedProject = { ...project, slug: finalSlug, images, updatedAt: new Date().toISOString() }
      await repository.saveProject(savedProject)
      databaseSaved = true

      const replacedPaths = existing?.images
        .filter((oldImage) => oldImage.storagePath && images.find((image) => image.position === oldImage.position)?.storagePath !== oldImage.storagePath)
        .map((image) => image.storagePath as string) ?? []
      if (mediaService && replacedPaths.length) {
        try { await mediaService.removeProjectImages(replacedPaths) }
        catch { showToast('Project saved, but replaced image cleanup needs attention.', 'info') }
      }

      clearPendingMedia()
      setProject(savedProject)
      showToast(isNew ? 'Project created.' : 'Project changes saved.')
      navigate('/admin/projects')
    } catch (error) {
      let cleanupFailed = false
      if (!databaseSaved && mediaService && uploadedPaths.length) {
        try { await mediaService.removeProjectImages(uploadedPaths) } catch { cleanupFailed = true }
      }
      const message = error instanceof Error ? error.message : 'Failed to save project. Please try again.'
      setErrors([cleanupFailed ? `${message} Newly uploaded files may require manual cleanup.` : message])
      showToast('Project was not saved. Your form data is still here.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return <>
    <PageHeader eyebrow="Projects / Editor" title={title} description="Keep the public project story and its three-image signature gallery in one place." />
    <form className="admin-form" onSubmit={handleSubmit}>
      {errors.length > 0 && <div className="admin-error" role="alert">{errors.map((error) => <div key={error}>{error}</div>)}</div>}
      <div className="editor-layout">
        <div className="admin-card"><div className="admin-card-body">
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
          <section className="form-section"><h2 className="form-section-title">Exactly three gallery images</h2><p className="admin-field"><small>{repository.mode === 'supabase' ? 'Selected files are previewed locally and uploaded only when you save.' : 'Local demo selections remain temporary previews; use an image URL for persisted demo data.'}</small></p><div className="image-editor-grid">
            {project.images.map((image) => <div className="image-editor-card" key={image.position}><div className="image-preview"><img src={previewUrls[image.position] ?? image.src} alt={image.alt || `Gallery image ${image.position} preview`} /><span>0{image.position}</span></div><div className="image-editor-body"><AdminField label="Image URL"><TextInput value={image.src} onChange={(event) => updateImage(image.position, 'src', event.target.value)} placeholder="https://..." /></AdminField><AdminField label="Alt text"><TextInput value={image.alt} onChange={(event) => updateImage(image.position, 'alt', event.target.value)} placeholder="Describe the image" /></AdminField><AdminField label="Caption"><TextInput value={image.caption} onChange={(event) => updateImage(image.position, 'caption', event.target.value)} placeholder="A unique caption" /></AdminField><label className="admin-button button-quiet" htmlFor={`file-${image.position}`}><AdminIcon name="arrow" size={14} /> Replace<input id={`file-${image.position}`} className="file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleFile(image.position, event)} disabled={saving} /></label><button className="admin-button button-quiet" type="button" onClick={() => resetPreview(image.position)} disabled={saving || !pendingFiles[image.position]}>Reset preview</button></div></div>)}
          </div></section>
        </div></div>
        <aside className="editor-side"><div className="editor-side-card"><h2>Publishing</h2><Toggle label="Visible on public page" checked={project.published} onChange={(value) => update('published', value)} /><p style={{ marginTop: 12 }}>Drafts stay available in the admin list but are hidden from the public portfolio.</p></div><div className="editor-side-card"><h2>Image note</h2><p>External image URLs and managed Supabase Storage images can be mixed across the three slots.</p></div></aside>
      </div>
      <div className="form-actions"><div className="form-feedback">{saving ? 'Uploading and saving…' : ''}</div><button type="button" className="admin-button button-quiet" onClick={() => navigate('/admin/projects')} disabled={saving}>Cancel</button><button type="submit" className="admin-button button-dark" disabled={saving}>{saving ? 'Saving' : 'Save project'} <AdminIcon name="arrow" size={14} /></button></div>
    </form>
  </>
}
