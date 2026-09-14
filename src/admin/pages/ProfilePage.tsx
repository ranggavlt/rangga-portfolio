import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { Profile } from '../../domain/types'
import { mediaService, validateCvPdf, validatePortraitImage } from '../../media/mediaService'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { errorMessage, formatFileSize, isHttpUrl, storageFileName } from '../lib/validation'
import { AdminIcon, PageHeader, useToast } from '../components/AdminUI'
import { AdminField, TextArea, TextInput } from '../components/FormControls'

type MediaMode = 'upload' | 'external'

const initialMode = (storagePath: string | null | undefined, url: string, uploadAvailable: boolean): MediaMode => {
  if (!uploadAvailable) return 'external'
  return storagePath || !url ? 'upload' : 'external'
}

export default function ProfilePage() {
  const { data, repository } = usePortfolio()
  const { showToast } = useToast()
  const uploadAvailable = repository.mode === 'supabase'
  const [profile, setProfile] = useState(data.profile)
  const [portraitMode, setPortraitMode] = useState<MediaMode>(() => initialMode(data.profile.portraitStoragePath, data.profile.portraitUrl, uploadAvailable))
  const [cvMode, setCvMode] = useState<MediaMode>(() => initialMode(data.profile.cvStoragePath, data.profile.cvUrl, uploadAvailable))
  const [portraitExternalUrl, setPortraitExternalUrl] = useState(data.profile.portraitStoragePath ? '' : data.profile.portraitUrl)
  const [cvExternalUrl, setCvExternalUrl] = useState(data.profile.cvStoragePath ? '' : data.profile.cvUrl)
  const [portraitFile, setPortraitFile] = useState<File | null>(null)
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null)
  const portraitPreviewRef = useRef<string | null>(null)
  const portraitInputRef = useRef<HTMLInputElement>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)
  const [removePortrait, setRemovePortrait] = useState(false)
  const [removeCv, setRemoveCv] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  useEffect(() => () => {
    if (portraitPreviewRef.current) URL.revokeObjectURL(portraitPreviewRef.current)
  }, [])

  const clearPortraitSelection = () => {
    if (portraitPreviewRef.current) URL.revokeObjectURL(portraitPreviewRef.current)
    portraitPreviewRef.current = null
    setPortraitPreview(null)
    setPortraitFile(null)
  }

  const handlePortrait = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      validatePortraitImage(file)
      clearPortraitSelection()
      const preview = URL.createObjectURL(file)
      portraitPreviewRef.current = preview
      setPortraitPreview(preview)
      setPortraitFile(file)
      setRemovePortrait(false)
      setError('')
    } catch (reason) {
      setError(errorMessage(reason, 'The selected portrait is not valid.'))
    }
  }

  const handleCv = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      validateCvPdf(file)
      setCvFile(file)
      setRemoveCv(false)
      setError('')
    } catch (reason) {
      setError(errorMessage(reason, 'The selected CV is not valid.'))
    }
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (saving) return
    if (!profile.fullName.trim() || !profile.professionalTitle.trim() || !profile.email.trim()) {
      setError('Name, title, and email are required.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(profile.email.trim())) {
      setError('Enter a valid profile email address.')
      return
    }
    if (portraitMode === 'external' && portraitExternalUrl.trim() && !isHttpUrl(portraitExternalUrl, false)) {
      setError('External portrait URL must start with http:// or https://.')
      return
    }
    if (cvMode === 'external' && cvExternalUrl.trim() && !isHttpUrl(cvExternalUrl, false)) {
      setError('External CV URL must start with http:// or https://.')
      return
    }
    try {
      if (portraitFile) validatePortraitImage(portraitFile)
      if (cvFile) validateCvPdf(cvFile)
    } catch (reason) {
      setError(errorMessage(reason, 'A selected file is not valid.'))
      return
    }

    setSaving(true)
    setError('')
    setSaveStatus('Preparing profile…')
    let uploadedPortraitPath: string | null = null
    let uploadedCvPath: string | null = null
    let databaseSaved = false

    try {
      let savedProfile: Profile = { ...profile, email: profile.email.trim() }

      if (portraitMode === 'external') {
        const nextUrl = portraitExternalUrl.trim()
        if (removePortrait) savedProfile = { ...savedProfile, portraitUrl: '', portraitStoragePath: null }
        else if (nextUrl) savedProfile = { ...savedProfile, portraitUrl: nextUrl, portraitStoragePath: null }
      } else {
        if (removePortrait) savedProfile = { ...savedProfile, portraitUrl: '', portraitStoragePath: null }
        if (portraitFile) {
          if (!mediaService) throw new Error('Managed portrait uploads require Supabase mode. Switch to External URL in local mode.')
          setSaveStatus('Uploading portrait…')
          const uploaded = await mediaService.uploadPortrait(portraitFile)
          uploadedPortraitPath = uploaded.storagePath
          savedProfile = { ...savedProfile, portraitUrl: uploaded.publicUrl, portraitStoragePath: uploaded.storagePath }
        }
      }

      if (cvMode === 'external') {
        const nextUrl = cvExternalUrl.trim()
        if (removeCv) savedProfile = { ...savedProfile, cvUrl: '', cvStoragePath: null }
        else if (nextUrl) savedProfile = { ...savedProfile, cvUrl: nextUrl, cvStoragePath: null }
      } else {
        if (removeCv) savedProfile = { ...savedProfile, cvUrl: '', cvStoragePath: null }
        if (cvFile) {
          if (!mediaService) throw new Error('Managed CV uploads require Supabase mode. Switch to External URL in local mode.')
          setSaveStatus('Uploading CV PDF…')
          const uploaded = await mediaService.uploadCv(cvFile)
          uploadedCvPath = uploaded.storagePath
          savedProfile = { ...savedProfile, cvUrl: uploaded.publicUrl, cvStoragePath: uploaded.storagePath }
        }
      }

      setSaveStatus('Saving profile…')
      await repository.saveProfile(savedProfile)
      databaseSaved = true

      if (mediaService) {
        const oldPortraitPath = data.profile.portraitStoragePath
        const oldCvPath = data.profile.cvStoragePath
        if (oldPortraitPath && oldPortraitPath !== savedProfile.portraitStoragePath) {
          setSaveStatus('Cleaning replaced portrait…')
          try { await mediaService.removePortrait(oldPortraitPath) }
          catch { showToast('Profile saved, but the replaced portrait could not be removed.', 'info') }
        }
        if (oldCvPath && oldCvPath !== savedProfile.cvStoragePath) {
          setSaveStatus('Cleaning replaced CV…')
          try { await mediaService.removeCv(oldCvPath) }
          catch { showToast('Profile saved, but the replaced CV could not be removed.', 'info') }
        }
      }

      clearPortraitSelection()
      setCvFile(null)
      setRemovePortrait(false)
      setRemoveCv(false)
      setProfile(savedProfile)
      setPortraitExternalUrl(savedProfile.portraitStoragePath ? '' : savedProfile.portraitUrl)
      setCvExternalUrl(savedProfile.cvStoragePath ? '' : savedProfile.cvUrl)
      setPortraitMode(initialMode(savedProfile.portraitStoragePath, savedProfile.portraitUrl, uploadAvailable))
      setCvMode(initialMode(savedProfile.cvStoragePath, savedProfile.cvUrl, uploadAvailable))
      showToast('Profile settings saved.')
    } catch (reason) {
      let cleanupFailed = false
      if (!databaseSaved && mediaService && uploadedPortraitPath) {
        try { await mediaService.removePortrait(uploadedPortraitPath) } catch { cleanupFailed = true }
      }
      if (!databaseSaved && mediaService && uploadedCvPath) {
        try { await mediaService.removeCv(uploadedCvPath) } catch { cleanupFailed = true }
      }
      const message = errorMessage(reason, 'Failed to save profile. Please try again.')
      setError(cleanupFailed ? `${message} A newly uploaded file may require manual cleanup.` : message)
      showToast('Profile was not saved. Your form data and selected files are still here.', 'error')
    } finally {
      setSaving(false)
      setSaveStatus('')
    }
  }

  const currentPortraitUrl = removePortrait ? '' : (portraitPreview ?? profile.portraitUrl)
  const hasCurrentPortrait = Boolean(profile.portraitUrl)
  const hasCurrentCv = Boolean(profile.cvUrl)

  return <>
    <PageHeader eyebrow="Settings / Profile" title="Profile" description="Update the identity, media, and narrative fields used across the public portfolio." />
    {error && <div className="admin-error profile-error" role="alert">{error}</div>}
    <form className="admin-card admin-form profile-form" onSubmit={save} aria-busy={saving}>
      <div className="admin-card-body profile-card-body">
        <section className="form-section"><h2 className="form-section-title">Identity</h2><div className="form-grid">
          <AdminField label="Full name"><TextInput value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} disabled={saving} /></AdminField>
          <AdminField label="Professional title"><TextInput value={profile.professionalTitle} onChange={(event) => setProfile({ ...profile, professionalTitle: event.target.value })} disabled={saving} /></AdminField>
          <AdminField label="Email"><TextInput type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} disabled={saving} /></AdminField>
          <AdminField label="Location"><TextInput value={profile.location} onChange={(event) => setProfile({ ...profile, location: event.target.value })} disabled={saving} /></AdminField>
          <AdminField label="Availability text"><TextInput value={profile.availabilityText} onChange={(event) => setProfile({ ...profile, availabilityText: event.target.value })} disabled={saving} /></AdminField>
        </div></section>

        <section className="form-section"><h2 className="form-section-title">CV document</h2><div className="media-source-tabs" role="group" aria-label="CV source">
          <button className={cvMode === 'upload' ? 'is-active' : ''} type="button" onClick={() => setCvMode('upload')} disabled={saving || !uploadAvailable} aria-pressed={cvMode === 'upload'}>Upload PDF <span>Recommended</span></button>
          <button className={cvMode === 'external' ? 'is-active' : ''} type="button" onClick={() => setCvMode('external')} disabled={saving} aria-pressed={cvMode === 'external'}>External URL <span>Optional</span></button>
        </div>
        {cvMode === 'upload' ? <div className="media-source-panel">
          <p className="media-help">Choose a PDF up to 10 MB. It remains local until you click Save profile.</p>
          {hasCurrentCv && !removeCv && <div className="media-current"><div><span>Current CV</span><strong>{storageFileName(profile.cvStoragePath, 'External CV document')}</strong></div><a className="admin-link" href={profile.cvUrl} target="_blank" rel="noreferrer">Open current</a></div>}
          {removeCv && <div className="media-removal">The current CV will be removed after a successful save. <button type="button" onClick={() => setRemoveCv(false)} disabled={saving}>Undo</button></div>}
          <input ref={cvInputRef} className="file-input" type="file" accept="application/pdf" onChange={handleCv} disabled={saving} aria-label="Choose CV PDF" />
          <button className={`media-dropzone ${cvFile ? 'has-selection' : ''}`} type="button" onClick={() => cvInputRef.current?.click()} disabled={saving}>
            <AdminIcon name="arrow" size={16} /><strong>{cvFile ? 'Replace selected PDF' : 'Choose CV PDF'}</strong><span>Click or press Enter / Space · PDF only · 10 MB maximum</span>
          </button>
          {cvFile && <div className="media-selection"><div><strong>{cvFile.name}</strong><span>{formatFileSize(cvFile.size)} · Pending upload</span></div><button type="button" onClick={() => setCvFile(null)} disabled={saving}>Clear selection</button></div>}
          <div className="media-actions">{hasCurrentCv && !removeCv && <button className="admin-button button-quiet" type="button" onClick={() => setRemoveCv(true)} disabled={saving}>Remove current CV</button>}</div>
          {profile.cvStoragePath && <details className="media-advanced"><summary>Managed storage details</summary><AdminField label="Storage path"><TextInput value={profile.cvStoragePath} readOnly /></AdminField></details>}
        </div> : <div className="media-source-panel"><p className="media-help">Use a complete public http:// or https:// link. No file is uploaded in this mode.</p><AdminField label="External CV URL" hint={profile.cvStoragePath ? 'The current managed CV stays unchanged until you save a new URL or choose Remove current CV.' : undefined}><TextInput type="url" value={cvExternalUrl} onChange={(event) => { setCvExternalUrl(event.target.value); setRemoveCv(false) }} placeholder="https://example.com/cv.pdf" disabled={saving} /></AdminField><div className="media-actions">{hasCurrentCv && !removeCv && <><a className="admin-link" href={profile.cvUrl} target="_blank" rel="noreferrer">Open current CV</a><button className="admin-button button-quiet" type="button" onClick={() => setRemoveCv(true)} disabled={saving}>Remove current CV</button></>}{removeCv && <button className="admin-button button-quiet" type="button" onClick={() => setRemoveCv(false)} disabled={saving}>Undo removal</button>}</div></div>}
        </section>

        <section className="form-section"><h2 className="form-section-title">Hero</h2><div className="admin-form">
          <AdminField label="Hero eyebrow"><TextInput value={profile.heroEyebrow} onChange={(event) => setProfile({ ...profile, heroEyebrow: event.target.value })} disabled={saving} /></AdminField>
          <AdminField label="Hero heading"><TextInput value={profile.heroHeading} onChange={(event) => setProfile({ ...profile, heroHeading: event.target.value })} disabled={saving} /></AdminField>
          <AdminField label="Hero description"><TextArea rows={4} value={profile.heroDescription} onChange={(event) => setProfile({ ...profile, heroDescription: event.target.value })} disabled={saving} /></AdminField>
        </div></section>

        <section className="form-section"><h2 className="form-section-title">About</h2><div className="admin-form">
          <AdminField label="About heading"><TextInput value={profile.aboutHeading} onChange={(event) => setProfile({ ...profile, aboutHeading: event.target.value })} disabled={saving} /></AdminField>
          <AdminField label="About biography"><TextArea rows={6} value={profile.aboutBiography} onChange={(event) => setProfile({ ...profile, aboutBiography: event.target.value })} disabled={saving} /></AdminField>
          <AdminField label="About secondary text"><TextArea rows={5} value={profile.aboutSecondary} onChange={(event) => setProfile({ ...profile, aboutSecondary: event.target.value })} disabled={saving} /></AdminField>
        </div></section>

        <section className="form-section"><h2 className="form-section-title">Portrait and footer</h2><div className="profile-media-grid">
          <div className="profile-portrait-preview">{currentPortraitUrl ? <img src={currentPortraitUrl} alt={`${profile.fullName} portrait preview`} /> : <div><span>No portrait selected</span></div>}</div>
          <div className="profile-media-controls"><div className="media-source-tabs" role="group" aria-label="Portrait source">
            <button className={portraitMode === 'upload' ? 'is-active' : ''} type="button" onClick={() => setPortraitMode('upload')} disabled={saving || !uploadAvailable} aria-pressed={portraitMode === 'upload'}>Upload image <span>Recommended</span></button>
            <button className={portraitMode === 'external' ? 'is-active' : ''} type="button" onClick={() => setPortraitMode('external')} disabled={saving} aria-pressed={portraitMode === 'external'}>External URL <span>Optional</span></button>
          </div>
          {portraitMode === 'upload' ? <div className="media-source-panel compact"><p className="media-help">JPEG, PNG, or WebP up to 3 MB. Upload occurs only when you save.</p>{removePortrait && <div className="media-removal">The current portrait will be removed after save. <button type="button" onClick={() => setRemovePortrait(false)} disabled={saving}>Undo</button></div>}<input ref={portraitInputRef} className="file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePortrait} disabled={saving} aria-label="Choose portrait image" /><button className={`media-dropzone ${portraitFile ? 'has-selection' : ''}`} type="button" onClick={() => portraitInputRef.current?.click()} disabled={saving}><AdminIcon name="arrow" size={16} /><strong>{portraitFile ? 'Replace selected portrait' : 'Choose portrait image'}</strong><span>Click or press Enter / Space · JPEG, PNG, WebP</span></button>{portraitFile && <div className="media-selection"><div><strong>{portraitFile.name}</strong><span>{formatFileSize(portraitFile.size)} · Pending upload</span></div><button type="button" onClick={clearPortraitSelection} disabled={saving}>Clear selection</button></div>}<div className="media-actions">{hasCurrentPortrait && !removePortrait && <button className="admin-button button-quiet" type="button" onClick={() => { clearPortraitSelection(); setRemovePortrait(true) }} disabled={saving}>Remove current portrait</button>}</div>{profile.portraitStoragePath && <details className="media-advanced"><summary>Managed storage details</summary><AdminField label="Storage path"><TextInput value={profile.portraitStoragePath} readOnly /></AdminField></details>}</div> : <div className="media-source-panel compact"><p className="media-help">Use a complete public http:// or https:// image URL. No file is uploaded.</p><AdminField label="External portrait URL" hint={profile.portraitStoragePath ? 'The managed portrait stays unchanged until a new URL is saved or it is explicitly removed.' : undefined}><TextInput type="url" value={portraitExternalUrl} onChange={(event) => { setPortraitExternalUrl(event.target.value); setRemovePortrait(false) }} placeholder="https://example.com/portrait.jpg" disabled={saving} /></AdminField><div className="media-actions">{hasCurrentPortrait && !removePortrait && <button className="admin-button button-quiet" type="button" onClick={() => { clearPortraitSelection(); setRemovePortrait(true) }} disabled={saving}>Remove current portrait</button>}{removePortrait && <button className="admin-button button-quiet" type="button" onClick={() => setRemovePortrait(false)} disabled={saving}>Undo removal</button>}</div></div>}
          </div>
        </div><div className="profile-footer-field"><AdminField label="Footer text"><TextInput value={profile.footerText} onChange={(event) => setProfile({ ...profile, footerText: event.target.value })} disabled={saving} /></AdminField></div></section>
      </div>
      <div className="form-actions profile-form-actions"><div className="form-feedback" role="status">{saving ? saveStatus : 'Saved changes update the public portfolio immediately.'}</div><button className="admin-button button-dark" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'} <AdminIcon name="arrow" size={14} /></button></div>
    </form>
  </>
}
