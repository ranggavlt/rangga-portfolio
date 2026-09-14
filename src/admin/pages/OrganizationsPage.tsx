import { useState } from 'react'
import { OrganizationEntry } from '../../domain/types'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { errorMessage, moveId } from '../lib/validation'
import { AdminIcon, ConfirmDialog, EmptyState, PageHeader, StatusBadge, useToast } from '../components/AdminUI'
import { AdminField, TextArea, TextInput, Toggle } from '../components/FormControls'

const emptyEntry = (): OrganizationEntry => ({ id: `organization-${Date.now()}`, name: '', meta: '', detail: '', published: true, displayOrder: 1 })

export default function OrganizationsPage() {
  const { data, repository } = usePortfolio()
  const { showToast } = useToast()
  const [draft, setDraft] = useState<OrganizationEntry | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState<'save' | 'reorder' | 'delete' | null>(null)
  const entries = [...data.organizations].sort((a, b) => a.displayOrder - b.displayOrder)

  const save = async () => {
    if (busy || !draft) return
    if (!draft.name.trim()) return showToast('Organization name is required.', 'error')
    setBusy('save')
    try { await repository.saveOrganization(draft); setDraft(null); showToast('Organization saved.') }
    catch (reason) { showToast(errorMessage(reason, 'Could not save the organization.'), 'error') }
    finally { setBusy(null) }
  }
  const move = async (index: number, direction: -1 | 1) => {
    if (busy) return
    const orderedIds = moveId(entries.map((entry) => entry.id), index, direction)
    if (orderedIds[index] === entries[index]?.id) return
    setBusy('reorder')
    try { await repository.reorderItems('organizations', orderedIds); showToast('Display order updated.', 'info') }
    catch (reason) { showToast(errorMessage(reason, 'Could not update display order.'), 'error') }
    finally { setBusy(null) }
  }
  const remove = async () => {
    if (!deleteId || busy) return
    setBusy('delete')
    try { await repository.deleteOrganization(deleteId); setDeleteId(null); showToast('Organization deleted.', 'info') }
    catch (reason) { showToast(errorMessage(reason, 'Could not delete the organization.'), 'error') }
    finally { setBusy(null) }
  }

  return <>
    <PageHeader eyebrow="Content / Organizations" title="Organizations" description="Maintain the expandable monochrome cards shown on the public page." action={<button className="admin-button button-dark" type="button" onClick={() => setDraft(emptyEntry())} disabled={Boolean(busy)}><AdminIcon name="plus" size={14} /> Add organization</button>} />
    {draft && <div className="admin-card form-editor-card"><div className="admin-card-header"><div><h2>{draft.name ? 'Edit organization' : 'New organization'}</h2><p>Published entries appear on the public portfolio.</p></div><button className="table-icon-button" type="button" onClick={() => setDraft(null)} aria-label="Close editor" disabled={Boolean(busy)}><AdminIcon name="close" size={15} /></button></div><div className="admin-card-body"><div className="form-grid"><AdminField label="Name"><TextInput value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="React Indonesia" disabled={Boolean(busy)} /></AdminField><AdminField label="Metadata"><TextInput value={draft.meta} onChange={(event) => setDraft({ ...draft, meta: event.target.value })} placeholder="Community · 2021—now" disabled={Boolean(busy)} /></AdminField><AdminField label="Display order"><TextInput type="number" min="1" value={draft.displayOrder} onChange={(event) => setDraft({ ...draft, displayOrder: Number(event.target.value) })} disabled={Boolean(busy)} /></AdminField></div><div className="form-block"><AdminField label="Description"><TextArea rows={4} value={draft.detail} onChange={(event) => setDraft({ ...draft, detail: event.target.value })} disabled={Boolean(busy)} /></AdminField></div><div className="form-block"><Toggle label="Published on public page" checked={draft.published} onChange={(published) => setDraft({ ...draft, published })} /></div><div className="form-actions form-actions-spaced"><button className="admin-button button-quiet" type="button" onClick={() => setDraft(null)} disabled={Boolean(busy)}>Cancel</button><button className="admin-button button-dark" type="button" onClick={save} disabled={Boolean(busy)}>{busy === 'save' ? 'Saving…' : 'Save entry'} <AdminIcon name="arrow" size={14} /></button></div></div></div>}
    {entries.length === 0 ? <EmptyState title="No organizations yet" description="Add a community, reading group, or independent practice." /> : <div className="admin-card"><div className="admin-card-header"><h2>{entries.length} entries</h2></div><div className="admin-card-body"><ul className="inline-list">{entries.map((entry, index) => <li key={entry.id}><div className="inline-list-copy"><strong>{entry.name}</strong><span>{entry.meta}</span></div><div className="table-actions"><StatusBadge published={entry.published} /><button className="table-icon-button" type="button" onClick={() => setDraft({ ...entry })} aria-label={`Edit ${entry.name}`} disabled={Boolean(busy)}><AdminIcon name="edit" size={14} /></button><button className="table-icon-button" type="button" onClick={() => move(index, -1)} disabled={Boolean(busy) || index === 0} aria-label="Move up">↑</button><button className="table-icon-button" type="button" onClick={() => move(index, 1)} disabled={Boolean(busy) || index === entries.length - 1} aria-label="Move down">↓</button><button className="table-icon-button danger" type="button" onClick={() => setDeleteId(entry.id)} aria-label={`Delete ${entry.name}`} disabled={Boolean(busy)}><AdminIcon name="trash" size={14} /></button></div></li>)}</ul></div></div>}
    <ConfirmDialog open={Boolean(deleteId)} title="Delete this organization?" description="It will be removed from the repository and the public page." confirmLabel={busy === 'delete' ? 'Deleting…' : 'Delete organization'} danger onConfirm={remove} onCancel={() => { if (!busy) setDeleteId(null) }} busy={busy === 'delete'} />
  </>
}
