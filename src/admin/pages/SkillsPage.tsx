import { useState } from 'react'
import { SkillGroup } from '../../domain/types'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { AdminIcon, ConfirmDialog, EmptyState, PageHeader, useToast } from '../components/AdminUI'
import { AdminField, TagsInput, TextInput } from '../components/FormControls'

const emptyGroup = (): SkillGroup => ({ id: `skill-group-${Date.now()}`, label: '', skills: [], displayOrder: 1 })

export default function SkillsPage() {
  const { data, repository } = usePortfolio()
  const { showToast } = useToast()
  const [draft, setDraft] = useState<SkillGroup | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const groups = [...data.skills].sort((a, b) => a.displayOrder - b.displayOrder)
  const save = async () => { if (!draft?.label.trim()) return showToast('Skill-group name is required.', 'error'); await repository.saveSkillGroup(draft); setDraft(null); showToast('Skill group saved locally.') }
  const move = async (index: number, direction: -1 | 1) => { const other = groups[index + direction]; const current = groups[index]; if (!other) return; await repository.saveSkillGroup({ ...current, displayOrder: other.displayOrder }); await repository.saveSkillGroup({ ...other, displayOrder: current.displayOrder }); showToast('Display order updated.', 'info') }
  return <>
    <PageHeader eyebrow="Content / Skills" title="Skills & expertise" description="Manage the categorized skills grid without changing its public layout." action={<button className="admin-button button-dark" type="button" onClick={() => setDraft(emptyGroup())}><AdminIcon name="plus" size={14} /> Add skill group</button>} />
    {draft && <div className="admin-card form-editor-card"><div className="admin-card-header"><div><h2>{draft.label ? 'Edit skill group' : 'New skill group'}</h2><p>Press Enter to add individual skills.</p></div><button className="table-icon-button" type="button" onClick={() => setDraft(null)} aria-label="Close editor"><AdminIcon name="close" size={15} /></button></div><div className="admin-card-body"><div className="form-grid"><AdminField label="Skill-group name"><TextInput value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} placeholder="Frontend" /></AdminField><AdminField label="Display order"><TextInput type="number" value={draft.displayOrder} onChange={(event) => setDraft({ ...draft, displayOrder: Number(event.target.value) })} /></AdminField></div><div style={{ marginTop: 20 }}><AdminField label="Individual skills"><TagsInput value={draft.skills} onChange={(skills) => setDraft({ ...draft, skills })} /></AdminField></div><div className="form-actions" style={{ marginTop: 22 }}><button className="admin-button button-quiet" type="button" onClick={() => setDraft(null)}>Cancel</button><button className="admin-button button-dark" type="button" onClick={save}>Save group <AdminIcon name="arrow" size={14} /></button></div></div></div>}
    {groups.length === 0 ? <EmptyState title="No skill groups yet" description="Add a category to build the public skills grid." /> : <div className="admin-card"><div className="admin-card-header"><h2>{groups.length} groups</h2></div><div className="admin-card-body"><ul className="inline-list">{groups.map((group, index) => <li key={group.id}><div><strong>{group.label}</strong><span>{group.skills.join(' · ') || 'No skills added yet'}</span></div><div className="table-actions"><button className="table-icon-button" type="button" onClick={() => setDraft({ ...group })} aria-label={`Edit ${group.label}`}><AdminIcon name="edit" size={14} /></button><button className="table-icon-button" type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">↑</button><button className="table-icon-button" type="button" onClick={() => move(index, 1)} disabled={index === groups.length - 1} aria-label="Move down">↓</button><button className="table-icon-button danger" type="button" onClick={() => setDeleteId(group.id)} aria-label={`Delete ${group.label}`}><AdminIcon name="trash" size={14} /></button></div></li>)}</ul></div></div>}
    <ConfirmDialog open={Boolean(deleteId)} title="Delete this skill group?" description="It will be removed from the local repository and the public skills grid." confirmLabel="Delete group" danger onConfirm={async () => { if (deleteId) await repository.deleteSkillGroup(deleteId); setDeleteId(null); showToast('Skill group deleted.', 'info') }} onCancel={() => setDeleteId(null)} />
  </>
}
