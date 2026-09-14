import { useState } from 'react'
import { ExperienceEntry } from '../../domain/types'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { errorMessage, moveId } from '../lib/validation'
import { AdminIcon, ConfirmDialog, EmptyState, PageHeader, StatusBadge, useToast } from '../components/AdminUI'
import { AdminField, TextArea, TextInput, Toggle } from '../components/FormControls'

const emptyEntry = (): ExperienceEntry => ({ id: `experience-${Date.now()}`, period: '', company: '', role: '', description: '', published: true, displayOrder: 1 })

export default function ExperiencePage() {
  const { data, repository } = usePortfolio()
  const { showToast } = useToast()
  const [draft, setDraft] = useState<ExperienceEntry | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState<'save' | 'reorder' | 'delete' | null>(null)
  const entries = [...data.experience].sort((a, b) => a.displayOrder - b.displayOrder)

  const save = async () => {
    if (busy || !draft) return
    if (!draft.company.trim() || !draft.role.trim()) return showToast('Company and role are required.', 'error')
    setBusy('save')
    try {
      await repository.saveExperience(draft)
      setDraft(null)
      showToast('Experience entry saved.')
    } catch (reason) {
      showToast(errorMessage(reason, 'Could not save the experience entry.'), 'error')
    } finally { setBusy(null) }
  }

  const move = async (index: number, direction: -1 | 1) => {
    if (busy) return
    const orderedIds = moveId(entries.map((entry) => entry.id), index, direction)
    if (orderedIds[index] === entries[index]?.id) return
    setBusy('reorder')
    try {
      await repository.reorderItems('experience', orderedIds)
      showToast('Display order updated.', 'info')
    } catch (reason) {
      showToast(errorMessage(reason, 'Could not update display order.'), 'error')
    } finally { setBusy(null) }
  }

  const remove = async () => {
    if (!deleteId || busy) return
    setBusy('delete')
    try {
      await repository.deleteExperience(deleteId)
      setDeleteId(null)
      showToast('Experience entry deleted.', 'info')
    } catch (reason) {
      showToast(errorMessage(reason, 'Could not delete the experience entry.'), 'error')
    } finally { setBusy(null) }
  }

  return <>
    <PageHeader eyebrow="Content / Work experience" title="Experience" description="Shape the editorial work history shown on the public portfolio." action={<button className="admin-button button-dark" type="button" onClick={() => setDraft(emptyEntry())} disabled={Boolean(busy)}><AdminIcon name="plus" size={14} /> Add experience</button>} />
    {draft && <div className="admin-card form-editor-card"><div className="admin-card-header"><div><h2>{draft.company ? 'Edit experience' : 'New experience'}</h2><p>{repository.mode === 'local' ? 'Changes stay in this browser’s local workspace.' : 'Changes are saved to the live portfolio database.'}</p></div><button className="table-icon-button" type="button" onClick={() => setDraft(null)} aria-label="Close editor" disabled={Boolean(busy)}><AdminIcon name="close" size={15} /></button></div><div className="admin-card-body"><div className="form-grid"><AdminField label="Period"><TextInput value={draft.period} onChange={(event) => setDraft({ ...draft, period: event.target.value })} placeholder="2024 — now" disabled={Boolean(busy)} /></AdminField><AdminField label="Company"><TextInput value={draft.company} onChange={(event) => setDraft({ ...draft, company: event.target.value })} placeholder="Independent / Jakarta + remote" disabled={Boolean(busy)} /></AdminField><AdminField label="Role"><TextInput value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} placeholder="Full-Stack Web Developer" disabled={Boolean(busy)} /></AdminField><AdminField label="Display order"><TextInput type="number" min="1" value={draft.displayOrder} onChange={(event) => setDraft({ ...draft, displayOrder: Number(event.target.value) })} disabled={Boolean(busy)} /></AdminField></div><div className="form-block"><AdminField label="Description"><TextArea rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} disabled={Boolean(busy)} /></AdminField></div><div className="form-block"><Toggle label="Published on public page" checked={draft.published} onChange={(published) => setDraft({ ...draft, published })} /></div><div className="form-actions form-actions-spaced"><button className="admin-button button-quiet" type="button" onClick={() => setDraft(null)} disabled={Boolean(busy)}>Cancel</button><button className="admin-button button-dark" type="button" onClick={save} disabled={Boolean(busy)}>{busy === 'save' ? 'Saving…' : 'Save entry'} <AdminIcon name="arrow" size={14} /></button></div></div></div>}
    {entries.length === 0 ? <EmptyState title="No experience yet" description="Add the first role to build the public timeline." /> : <div className="admin-card"><div className="admin-card-header"><h2>{entries.length} entries</h2></div><div className="admin-card-body"><ul className="inline-list">{entries.map((entry, index) => <li key={entry.id}><div className="inline-list-copy"><strong>{entry.role}</strong><span>{entry.company} · {entry.period}</span></div><div className="table-actions"><StatusBadge published={entry.published} /><button className="table-icon-button" type="button" onClick={() => setDraft({ ...entry })} aria-label={`Edit ${entry.role}`} disabled={Boolean(busy)}><AdminIcon name="edit" size={14} /></button><button className="table-icon-button" type="button" onClick={() => move(index, -1)} disabled={Boolean(busy) || index === 0} aria-label="Move up">↑</button><button className="table-icon-button" type="button" onClick={() => move(index, 1)} disabled={Boolean(busy) || index === entries.length - 1} aria-label="Move down">↓</button><button className="table-icon-button danger" type="button" onClick={() => setDeleteId(entry.id)} aria-label={`Delete ${entry.role}`} disabled={Boolean(busy)}><AdminIcon name="trash" size={14} /></button></div></li>)}</ul></div></div>}
    <ConfirmDialog open={Boolean(deleteId)} title="Delete this experience entry?" description="It will be removed from the repository and the public page." confirmLabel={busy === 'delete' ? 'Deleting…' : 'Delete entry'} danger onConfirm={remove} onCancel={() => { if (!busy) setDeleteId(null) }} busy={busy === 'delete'} />
  </>
}
