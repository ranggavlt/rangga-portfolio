import { useState } from 'react'
import { SocialLink } from '../../domain/types'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { errorMessage, isHttpUrl, moveId } from '../lib/validation'
import { AdminIcon, ConfirmDialog, EmptyState, PageHeader, useToast } from '../components/AdminUI'
import { AdminField, TextInput, Toggle } from '../components/FormControls'

const emptyLink = (): SocialLink => ({ id: `social-${Date.now()}`, platform: '', url: '', displayOrder: 1, enabled: true })

export default function SocialLinksPage() {
  const { data, repository } = usePortfolio()
  const { showToast } = useToast()
  const [draft, setDraft] = useState<SocialLink | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [busy, setBusy] = useState<'save' | 'reorder' | 'delete' | null>(null)
  const links = [...data.socialLinks].sort((a, b) => a.displayOrder - b.displayOrder)

  const save = async () => {
    if (busy || !draft) return
    if (!draft.platform.trim() || !draft.url.trim()) return showToast('Platform and URL are required.', 'error')
    if (!isHttpUrl(draft.url, false)) return showToast('Social URL must start with http:// or https://.', 'error')
    setBusy('save')
    try { await repository.saveSocialLink({ ...draft, url: draft.url.trim() }); setDraft(null); showToast('Social link saved.') }
    catch (reason) { showToast(errorMessage(reason, 'Could not save the social link.'), 'error') }
    finally { setBusy(null) }
  }
  const move = async (index: number, direction: -1 | 1) => {
    if (busy) return
    const orderedIds = moveId(links.map((link) => link.id), index, direction)
    if (orderedIds[index] === links[index]?.id) return
    setBusy('reorder')
    try { await repository.reorderItems('socialLinks', orderedIds); showToast('Display order updated.', 'info') }
    catch (reason) { showToast(errorMessage(reason, 'Could not update display order.'), 'error') }
    finally { setBusy(null) }
  }
  const remove = async () => {
    if (!deleteId || busy) return
    setBusy('delete')
    try { await repository.deleteSocialLink(deleteId); setDeleteId(null); showToast('Social link deleted.', 'info') }
    catch (reason) { showToast(errorMessage(reason, 'Could not delete the social link.'), 'error') }
    finally { setBusy(null) }
  }

  return <>
    <PageHeader eyebrow="Settings / Social links" title="Social links" description="Control which external profiles appear in the footer and their order." action={<button className="admin-button button-dark" type="button" onClick={() => setDraft(emptyLink())} disabled={Boolean(busy)}><AdminIcon name="plus" size={14} /> Add link</button>} />
    {draft && <div className="admin-card form-editor-card"><div className="admin-card-header"><div><h2>{draft.platform ? 'Edit social link' : 'New social link'}</h2><p>{repository.mode === 'local' ? 'Changes stay in this browser’s local workspace.' : 'Enabled links appear in the live public footer.'}</p></div><button className="table-icon-button" type="button" onClick={() => setDraft(null)} aria-label="Close editor" disabled={Boolean(busy)}><AdminIcon name="close" size={15} /></button></div><div className="admin-card-body"><div className="form-grid"><AdminField label="Platform"><TextInput value={draft.platform} onChange={(event) => setDraft({ ...draft, platform: event.target.value })} placeholder="GitHub" disabled={Boolean(busy)} /></AdminField><AdminField label="URL" hint="Use a complete http:// or https:// URL."><TextInput type="url" value={draft.url} onChange={(event) => setDraft({ ...draft, url: event.target.value })} placeholder="https://github.com/..." disabled={Boolean(busy)} /></AdminField><AdminField label="Display order"><TextInput type="number" min="1" value={draft.displayOrder} onChange={(event) => setDraft({ ...draft, displayOrder: Number(event.target.value) })} disabled={Boolean(busy)} /></AdminField></div><div className="form-block"><Toggle label="Enabled in public footer" checked={draft.enabled} onChange={(enabled) => setDraft({ ...draft, enabled })} /></div><div className="form-actions form-actions-spaced"><button className="admin-button button-quiet" type="button" onClick={() => setDraft(null)} disabled={Boolean(busy)}>Cancel</button><button className="admin-button button-dark" type="button" onClick={save} disabled={Boolean(busy)}>{busy === 'save' ? 'Saving…' : 'Save link'} <AdminIcon name="arrow" size={14} /></button></div></div></div>}
    {links.length === 0 ? <EmptyState title="No social links yet" description="Add the first external profile to the public footer." /> : <div className="admin-card"><div className="admin-card-header"><h2>{links.length} links</h2></div><div className="admin-card-body"><ul className="inline-list">{links.map((link, index) => <li key={link.id}><div className="inline-list-copy"><strong>{link.platform}</strong><span>{link.url}</span></div><div className="table-actions"><span className="status-badge"><span className={link.enabled ? 'status-dot-enabled' : ''} /> {link.enabled ? 'Enabled' : 'Disabled'}</span><button className="table-icon-button" type="button" onClick={() => setDraft({ ...link })} aria-label={`Edit ${link.platform}`} disabled={Boolean(busy)}><AdminIcon name="edit" size={14} /></button><button className="table-icon-button" type="button" onClick={() => move(index, -1)} disabled={Boolean(busy) || index === 0} aria-label="Move up">↑</button><button className="table-icon-button" type="button" onClick={() => move(index, 1)} disabled={Boolean(busy) || index === links.length - 1} aria-label="Move down">↓</button><button className="table-icon-button danger" type="button" onClick={() => setDeleteId(link.id)} aria-label={`Delete ${link.platform}`} disabled={Boolean(busy)}><AdminIcon name="trash" size={14} /></button></div></li>)}</ul></div></div>}
    <ConfirmDialog open={Boolean(deleteId)} title="Delete this social link?" description="It will be removed from the repository and public footer." confirmLabel={busy === 'delete' ? 'Deleting…' : 'Delete link'} danger onConfirm={remove} onCancel={() => { if (!busy) setDeleteId(null) }} busy={busy === 'delete'} />
  </>
}
