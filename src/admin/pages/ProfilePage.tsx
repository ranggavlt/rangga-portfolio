import { FormEvent, useState } from 'react'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { AdminIcon, PageHeader, useToast } from '../components/AdminUI'
import { AdminField, TextArea, TextInput } from '../components/FormControls'

export default function ProfilePage() {
  const { data, repository } = usePortfolio()
  const { showToast } = useToast()
  const [profile, setProfile] = useState(data.profile)
  const [saving, setSaving] = useState(false)

  const save = (event: FormEvent) => {
    event.preventDefault()
    if (!profile.fullName.trim() || !profile.professionalTitle.trim() || !profile.email.trim()) return showToast('Name, title, and email are required.', 'error')
    setSaving(true)
    window.setTimeout(() => { repository.saveProfile(profile); setSaving(false); showToast('Profile settings saved locally.') }, 350)
  }

  return <>
    <PageHeader eyebrow="Settings / Profile" title="Profile" description="Update the identity and narrative fields used across the public portfolio." />
    <form className="admin-card admin-form" onSubmit={save}><div className="admin-card-body"><section className="form-section"><h2 className="form-section-title">Identity</h2><div className="form-grid"><AdminField label="Full name"><TextInput value={profile.fullName} onChange={(event) => setProfile({ ...profile, fullName: event.target.value })} /></AdminField><AdminField label="Professional title"><TextInput value={profile.professionalTitle} onChange={(event) => setProfile({ ...profile, professionalTitle: event.target.value })} /></AdminField><AdminField label="Email"><TextInput type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></AdminField><AdminField label="Location"><TextInput value={profile.location} onChange={(event) => setProfile({ ...profile, location: event.target.value })} /></AdminField><AdminField label="Availability text"><TextInput value={profile.availabilityText} onChange={(event) => setProfile({ ...profile, availabilityText: event.target.value })} /></AdminField><AdminField label="CV URL"><TextInput type="url" value={profile.cvUrl} onChange={(event) => setProfile({ ...profile, cvUrl: event.target.value })} /></AdminField></div></section><section className="form-section"><h2 className="form-section-title">Hero</h2><div className="admin-form"><AdminField label="Hero eyebrow"><TextInput value={profile.heroEyebrow} onChange={(event) => setProfile({ ...profile, heroEyebrow: event.target.value })} /></AdminField><AdminField label="Hero heading"><TextInput value={profile.heroHeading} onChange={(event) => setProfile({ ...profile, heroHeading: event.target.value })} /></AdminField><AdminField label="Hero description"><TextArea rows={4} value={profile.heroDescription} onChange={(event) => setProfile({ ...profile, heroDescription: event.target.value })} /></AdminField></div></section><section className="form-section"><h2 className="form-section-title">About</h2><div className="admin-form"><AdminField label="About heading"><TextInput value={profile.aboutHeading} onChange={(event) => setProfile({ ...profile, aboutHeading: event.target.value })} /></AdminField><AdminField label="About biography"><TextArea rows={6} value={profile.aboutBiography} onChange={(event) => setProfile({ ...profile, aboutBiography: event.target.value })} /></AdminField><AdminField label="About secondary text"><TextArea rows={5} value={profile.aboutSecondary} onChange={(event) => setProfile({ ...profile, aboutSecondary: event.target.value })} /></AdminField><div className="form-grid"><AdminField label="Portrait URL"><TextInput type="url" value={profile.portraitUrl} onChange={(event) => setProfile({ ...profile, portraitUrl: event.target.value })} /></AdminField><AdminField label="Footer text"><TextInput value={profile.footerText} onChange={(event) => setProfile({ ...profile, footerText: event.target.value })} /></AdminField></div></div></section></div><div className="form-actions"><div className="form-feedback">{saving ? 'Saving locally…' : 'Changes affect the public route immediately.'}</div><button className="admin-button button-dark" type="submit" disabled={saving}>{saving ? 'Saving' : 'Save profile'} <AdminIcon name="arrow" size={14} /></button></div></form>
  </>
}
