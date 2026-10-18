import { ChangeEvent, useState } from 'react'
import { CertificateEntry } from '../../domain/types'
import { mediaService, validateCertificateFile } from '../../media/mediaService'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { AdminIcon, ConfirmDialog, EmptyState, PageHeader, StatusBadge, useToast } from '../components/AdminUI'
import { AdminField, TextInput, Toggle } from '../components/FormControls'
import { errorMessage, formatFileSize, isHttpUrl, moveId } from '../lib/validation'

const emptyCertificate = (displayOrder: number): CertificateEntry => ({
  id: crypto.randomUUID(), name: '', issuer: '', issuedOn: '', verificationUrl: '', credentialId: '',
  proofUrl: '', proofStoragePath: null, published: false, displayOrder,
})

export default function CertificatesPage() {
  const { data, repository } = usePortfolio()
  const { showToast } = useToast()
  const entries = [...data.certificates].sort((a, b) => a.displayOrder - b.displayOrder)
  const [draft, setDraft] = useState<CertificateEntry | null>(null)
  const [proofMode, setProofMode] = useState<'url' | 'upload'>('url')
  const [file, setFile] = useState<File | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const edit = (entry: CertificateEntry) => {
    setDraft({ ...entry })
    setProofMode(entry.proofStoragePath && repository.mode === 'supabase' ? 'upload' : 'url')
    setFile(null)
    setError('')
  }

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    event.target.value = ''
    if (!selected) return
    try { validateCertificateFile(selected); setFile(selected); setError('') }
    catch (reason) { setError(errorMessage(reason, 'Invalid certificate proof.')) }
  }

  const save = async () => {
    if (!draft || busy) return
    if (!draft.name.trim() || !draft.issuer.trim() || !draft.issuedOn || !/^\d{4}-\d{2}-\d{2}$/.test(draft.issuedOn) || Number.isNaN(Date.parse(draft.issuedOn))) {
      setError('Name, issuer, and a valid issue date are required.')
      return
    }
    if (!isHttpUrl(draft.verificationUrl)) { setError('Verification URL must start with http:// or https://.'); return }
    if (proofMode === 'url' && (!isHttpUrl(draft.proofUrl) || Boolean(draft.proofStoragePath))) { setError('Enter a new public proof URL to replace the managed file.'); return }
    if (draft.published && !(proofMode === 'upload' ? file || draft.proofUrl : draft.proofUrl.trim())) {
      setError('Add certificate proof before publishing.')
      return
    }
    setBusy(true)
    setError('')
    let uploadedPath: string | null = null
    let saved = false
    try {
      let next: CertificateEntry = {
        ...draft, name: draft.name.trim(), issuer: draft.issuer.trim(),
        verificationUrl: draft.verificationUrl.trim(), credentialId: draft.credentialId.trim(),
        proofUrl: draft.proofUrl.trim(),
      }
      if (proofMode === 'url') next = { ...next, proofStoragePath: null }
      if (proofMode === 'upload' && file) {
        if (!mediaService) throw new Error('Supabase mode is required for file upload.')
        const uploaded = await mediaService.uploadCertificate(file)
        uploadedPath = uploaded.storagePath
        next = { ...next, proofUrl: uploaded.publicUrl, proofStoragePath: uploaded.storagePath }
      }
      await repository.saveCertificate(next)
      saved = true
      const oldPath = entries.find((entry) => entry.id === draft.id)?.proofStoragePath
      if (mediaService && oldPath && oldPath !== next.proofStoragePath) {
        try { await mediaService.removeCertificate(oldPath) }
        catch { showToast('Certificate saved, but its previous file needs manual cleanup.', 'info') }
      }
      setDraft(null)
      setFile(null)
      showToast('Certificate saved.')
    } catch (reason) {
      if (!saved && uploadedPath && mediaService) {
        try { await mediaService.removeCertificate(uploadedPath) }
        catch { showToast('A new upload may need manual cleanup.', 'info') }
      }
      setError(errorMessage(reason, 'Could not save certificate.'))
    } finally { setBusy(false) }
  }

  const remove = async () => {
    if (!deleteId || busy) return
    const entry = entries.find((item) => item.id === deleteId)
    setBusy(true)
    try {
      await repository.deleteCertificate(deleteId)
      setDeleteId(null)
      if (entry?.proofStoragePath && mediaService) {
        try { await mediaService.removeCertificate(entry.proofStoragePath) }
        catch { showToast('Certificate deleted, but its file needs manual cleanup.', 'info') }
      }
      showToast('Certificate deleted.', 'info')
    } catch (reason) { showToast(errorMessage(reason, 'Could not delete certificate.'), 'error') }
    finally { setBusy(false) }
  }

  const move = async (index: number, direction: -1 | 1) => {
    if (busy) return
    const ids = moveId(entries.map((item) => item.id), index, direction)
    if (ids[index] === entries[index]?.id) return
    setBusy(true)
    try { await repository.reorderItems('certificates', ids); showToast('Display order updated.', 'info') }
    catch (reason) { showToast(errorMessage(reason, 'Could not reorder certificates.'), 'error') }
    finally { setBusy(false) }
  }

  return <>
    <PageHeader eyebrow="Content / Certificates" title="Certificates" description="Only published certificates with proof appear on the public page." action={<button className="admin-button button-dark" type="button" onClick={() => edit(emptyCertificate(entries.length + 1))} disabled={busy}><AdminIcon name="plus" size={14} /> Add certificate</button>} />
    {draft && <div className="admin-card form-editor-card"><div className="admin-card-header"><h2>{entries.some((entry) => entry.id === draft.id) ? 'Edit certificate' : 'New certificate'}</h2><button className="table-icon-button" type="button" onClick={() => setDraft(null)} aria-label="Close editor" disabled={busy}><AdminIcon name="close" size={15} /></button></div><div className="admin-card-body admin-form">
      {error && <div className="admin-error" role="alert">{error}</div>}
      <div className="form-grid"><AdminField label="Certificate name"><TextInput value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required disabled={busy} /></AdminField><AdminField label="Issuer"><TextInput value={draft.issuer} onChange={(event) => setDraft({ ...draft, issuer: event.target.value })} required disabled={busy} /></AdminField><AdminField label="Issue date"><TextInput type="date" value={draft.issuedOn} onChange={(event) => setDraft({ ...draft, issuedOn: event.target.value })} required disabled={busy} /></AdminField><AdminField label="Display order"><TextInput type="number" min="1" value={draft.displayOrder} onChange={(event) => setDraft({ ...draft, displayOrder: Number(event.target.value) })} disabled={busy} /></AdminField><AdminField label="Verification URL"><TextInput type="url" value={draft.verificationUrl} onChange={(event) => setDraft({ ...draft, verificationUrl: event.target.value })} placeholder="https://..." disabled={busy} /></AdminField><AdminField label="Credential ID"><TextInput value={draft.credentialId} onChange={(event) => setDraft({ ...draft, credentialId: event.target.value })} disabled={busy} /></AdminField></div>
      <div className="form-section"><h3 className="form-section-title">Certificate proof</h3><div className="media-source-tabs" role="group" aria-label="Certificate proof source"><button type="button" className={proofMode === 'url' ? 'is-active' : ''} aria-pressed={proofMode === 'url'} onClick={() => setProofMode('url')} disabled={busy}>Public URL</button><button type="button" className={proofMode === 'upload' ? 'is-active' : ''} aria-pressed={proofMode === 'upload'} onClick={() => setProofMode('upload')} disabled={busy || repository.mode !== 'supabase'}>Upload PDF or image</button></div>
      {proofMode === 'url' ? <AdminField label="Proof URL" hint="A public PDF or image URL. Required to publish."><TextInput type="url" value={draft.proofStoragePath ? '' : draft.proofUrl} onChange={(event) => setDraft({ ...draft, proofUrl: event.target.value, proofStoragePath: null })} placeholder="https://..." disabled={busy} /></AdminField> : <div className="media-source-panel"><p className="media-help">PDF, JPEG, PNG, or WebP up to 10 MB. Upload happens when you save.</p><input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={handleFile} disabled={busy} aria-label="Choose certificate proof" />{file && <p className="media-help">{file.name} · {formatFileSize(file.size)}</p>}</div>}
      {draft.proofUrl && <div className="media-actions"><a className="admin-link" href={draft.proofUrl} target="_blank" rel="noreferrer">Open current proof</a><button className="admin-button button-quiet" type="button" onClick={() => { setDraft({ ...draft, proofUrl: '', proofStoragePath: null, published: false }); setProofMode('url'); setFile(null) }} disabled={busy}>Remove proof</button></div>}</div>
      <Toggle label="Published on public page" checked={draft.published} onChange={(published) => setDraft({ ...draft, published })} disabled={busy} />
      <div className="form-actions form-actions-spaced"><button className="admin-button button-quiet" type="button" onClick={() => setDraft(null)} disabled={busy}>Cancel</button><button className="admin-button button-dark" type="button" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save certificate'} <AdminIcon name="arrow" size={14} /></button></div>
    </div></div>}
    {entries.length === 0 ? <EmptyState title="No certificates yet" description="Add a real certificate with proof when it is available." /> : <div className="admin-card"><div className="admin-card-header"><h2>{entries.length} certificates</h2></div><div className="admin-card-body"><ul className="inline-list">{entries.map((entry, index) => <li key={entry.id}><div className="inline-list-copy"><strong>{entry.name}</strong><span>{entry.issuer} · {entry.issuedOn}</span></div><div className="table-actions"><StatusBadge published={entry.published} /><button className="table-icon-button" type="button" onClick={() => edit(entry)} disabled={busy} aria-label={`Edit ${entry.name}`}><AdminIcon name="edit" size={14} /></button><button className="table-icon-button" type="button" onClick={() => move(index, -1)} disabled={busy || index === 0} aria-label={`Move ${entry.name} up`}>↑</button><button className="table-icon-button" type="button" onClick={() => move(index, 1)} disabled={busy || index === entries.length - 1} aria-label={`Move ${entry.name} down`}>↓</button><button className="table-icon-button danger" type="button" onClick={() => setDeleteId(entry.id)} disabled={busy} aria-label={`Delete ${entry.name}`}><AdminIcon name="trash" size={14} /></button></div></li>)}</ul></div></div>}
    <ConfirmDialog open={Boolean(deleteId)} title="Delete this certificate?" description="The entry and any managed proof file will be removed." confirmLabel={busy ? 'Deleting…' : 'Delete certificate'} danger onConfirm={remove} onCancel={() => { if (!busy) setDeleteId(null) }} busy={busy} />
  </>
}
