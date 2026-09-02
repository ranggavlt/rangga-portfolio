import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import { Profile } from '../../domain/types'
import { mediaService, validateCvPdf, validatePortraitImage } from '../../media/mediaService'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { AdminIcon, PageHeader, useToast } from '../components/AdminUI'
import { AdminField, TextArea, TextInput } from '../components/FormControls'

export default function ProfilePage() {
  const { data, repository } = usePortfolio()
  const { showToast } = useToast()
  const [profile, setProfile] = useState(data.profile)
  const [portraitFile, setPortraitFile] = useState<File | null>(null)
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null)
  const portraitPreviewRef = useRef<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => () => {
    if (portraitPreviewRef.current) URL.revokeObjectURL(portraitPreviewRef.current)
  }, [])

  const clearPortraitPreview = () => {
    if (portraitPreviewRef.current) URL.revokeObjectURL(portraitPreviewRef.current)
    portraitPreviewRef.current = null
    setPortraitPreview(null)
  }

  const handlePortrait = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      validatePortraitImage(file)
      clearPortraitPreview()
      const preview = URL.createObjectURL(file)
      portraitPreviewRef.current = preview
      setPortraitPreview(preview)
      setPortraitFile(file)
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The selected portrait is not valid.')
    }
  }

  const handleCv = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      validateCvPdf(file)
      setCvFile(file)
      setError('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The selected CV is not valid.')
    }
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    if (saving) return
    if (!profile.fullName.trim() || !profile.professionalTitle.trim() || !profile.email.trim()) {
      setError('Name, title, and email are required.')
      return
    }
    try {
      if (portraitFile) validatePortraitImage(portraitFile)
      if (cvFile) validateCvPdf(cvFile)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'A selected file is not valid.')
      return
    }

    setSaving(true)
    setError('')
    let uploadedPortraitPath: string | null = null
    let uploadedCvPath: string | null = null
    let databaseSaved = false
    try {
      let savedProfile: Profile = { ...profile }
      if (repository.mode === 'supabase') {
        if (!mediaService) throw new Error('Supabase Storage is not configured.')
        if (portraitFile) {
          const uploaded = await mediaService.uploadPortrait(portraitFile)
          uploadedPortraitPath = uploaded.storagePath
          savedProfile = { ...savedProfile, portraitUrl: uploaded.publicUrl, portraitStoragePath: uploaded.storagePath }
        }
        if (cvFile) {
          const uploaded = await mediaService.uploadCv(cvFile)
          uploadedCvPath = uploaded.storagePath
          savedProfile = { ...savedProfile, cvUrl: uploaded.publicUrl, cvStoragePath: uploaded.storagePath }
        }
      }

      await repository.saveProfile(savedProfile)
      databaseSaved = true

      if (mediaService) {
        const oldPortraitPath = data.profile.portraitStoragePath
        const oldCvPath = data.profile.cvStoragePath
        if (oldPortraitPath && oldPortraitPath !== savedProfile.portraitStoragePath) {
          try { await mediaService.removePortrait(oldPortraitPath) }
          catch { showToast('Profile saved, but the replaced portrait could not be removed.', 'info') }
        }
        if (oldCvPath && oldCvPath !== savedProfile.cvStoragePath) {
          try { await mediaService.removeCv(oldCvPath) }
          catch { showToast('Profile saved, but the replaced CV could not be removed.', 'info') }
        }
      }

      clearPortraitPreview()
      setPortraitFile(null)
      setCvFile(null)
      setProfile(savedProfile)
      showToast('Profile settings saved.')
    } catch (reason) {
      let cleanupFailed = false
      if (!databaseSaved && mediaService && uploadedPortraitPath) {
        try { await mediaService.removePortrait(uploadedPortraitPath) } catch { cleanupFailed = true }
      }
      if (!databaseSaved && mediaService && uploadedCvPath) {
        try { await mediaService.removeCv(uploadedCvPath) } catch { cleanupFailed = true }
      }
      const message = reason instanceof Error ? reason.message : 'Failed to save profile. Please try again.'
      setError(cleanupFailed ? `${message} Newly uploaded files may require manual cleanup.` : message)
      showToast('Profile was not saved. Your form data is still here.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return <>
    <PageHeader eyebrow="Settings / Profile" title="Profile" description="Update the identity and narrative fields used across the public portfolio." />
    {error && <div className="admin-error" role="alert">{error}</div>}
    <form className="admin-card admin-form" onSubmit={save}>
      <div className="admin-card-body">
        <section className="form-section"><h2 className="form-section-title">Identity</h2><div className="form-grid">
          <AdminField label="Full name"><TextInput value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} /></AdminField>
          <AdminField label="Professional title"><TextInput value={profile.professionalTitle} onChange={(event) => setProfile({ ...profile, professionalTitle: event.target.value })} /></AdminField>
          <AdminField label="Email"><TextInput type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></AdminField>
          <AdminField label="Location"><TextInput value={profile.location} onChange={(event) => setProfile({ ...profile, location: event.target.value })} /></AdminField>
          <AdminField label="Availability text"><TextInput value={profile.availabilityText} onChange={(event) => setProfile({ ...profile, availabilityText: event.target.value })} /></AdminField>
          <AdminField label="CV URL"><TextInput type="url" value={profile.cvUrl} onChange={(event) => setProfile({ ...profile, cvUrl: event.target.value, cvStoragePath: null })} /></AdminField>
        </div><div style={{ marginTop: 20 }}><AdminField label="Upload CV PDF" hint={cvFile ? `Selected: ${cvFile.name}` : 'PDF only, up to 10 MB. Upload occurs when you save.'}><div><label className="admin-button button-quiet" htmlFor="profile-cv-file"><AdminIcon name="arrow" size={14} /> {cvFile ? 'Replace selected PDF' : 'Choose PDF'}<input id="profile-cv-file" className="file-input" type="file" accept="application/pdf" onChange={handleCv} disabled={saving} /></label>{cvFile && <button className="admin-button button-quiet" type="button" onClick={() => setCvFile(null)} disabled={saving}>Clear selection</button>}</div></AdminField></div></section>

        <section className="form-section"><h2 className="form-section-title">Hero</h2><div className="admin-form">
          <AdminField label="Hero eyebrow"><TextInput value={profile.heroEyebrow} onChange={(event) => setProfile({ ...profile, heroEyebrow: event.target.value })} /></AdminField>
          <AdminField label="Hero heading"><TextInput value={profile.heroHeading} onChange={(event) => setProfile({ ...profile, heroHeading: event.target.value })} /></AdminField>
          <AdminField label="Hero description"><TextArea rows={4} value={profile.heroDescription} onChange={(event) => setProfile({ ...profile, heroDescription: event.target.value })} /></AdminField>
        </div></section>

        <section className="form-section"><h2 className="form-section-title">About</h2><div className="admin-form">
          <AdminField label="About heading"><TextInput value={profile.aboutHeading} onChange={(event) => setProfile({ ...profile, aboutHeading: event.target.value })} /></AdminField>
          <AdminField label="About biography"><TextArea rows={6} value={profile.aboutBiography} onChange={(event) => setProfile({ ...profile, aboutBiography: event.target.value })} /></AdminField>
          <AdminField label="About secondary text"><TextArea rows={5} value={profile.aboutSecondary} onChange={(event) => setProfile({ ...profile, aboutSecondary: event.target.value })} /></AdminField>
          <div className="form-grid"><AdminField label="Portrait URL"><TextInput type="url" value={profile.portraitUrl} onChange={(event) => setProfile({ ...profile, portraitUrl: event.target.value, portraitStoragePath: null })} /></AdminField><AdminField label="Footer text"><TextInput value={profile.footerText} onChange={(event) => setProfile({ ...profile, footerText: event.target.value })} /></AdminField></div>
          <div className="image-editor-card" style={{ maxWidth: 420 }}><div className="image-preview"><img src={portraitPreview ?? profile.portraitUrl} alt={`${profile.fullName} portrait preview`} /></div><div className="image-editor-body"><AdminField label="Upload portrait" hint="JPEG, PNG, or WebP; up to 3 MB. Upload occurs when you save."><div><label className="admin-button button-quiet" htmlFor="profile-portrait-file"><AdminIcon name="arrow" size={14} /> {portraitFile ? 'Replace selected portrait' : 'Choose portrait'}<input id="profile-portrait-file" className="file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePortrait} disabled={saving} /></label>{portraitFile && <button className="admin-button button-quiet" type="button" onClick={() => { clearPortraitPreview(); setPortraitFile(null) }} disabled={saving}>Reset preview</button>}</div></AdminField></div></div>
        </div></section>
      </div>
      <div className="form-actions"><div className="form-feedback">{saving ? 'Uploading and saving…' : 'Changes affect the public route immediately.'}</div><button className="admin-button button-dark" type="submit" disabled={saving}>{saving ? 'Saving' : 'Save profile'} <AdminIcon name="arrow" size={14} /></button></div>
    </form>
  </>
}
