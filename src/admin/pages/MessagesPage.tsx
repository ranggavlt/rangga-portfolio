import { useState } from 'react'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { errorMessage } from '../lib/validation'
import { AdminIcon, ConfirmDialog, EmptyState, PageHeader, useToast } from '../components/AdminUI'

export default function MessagesPage() {
  const { data, repository } = usePortfolio()
  const { showToast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const messages = [...data.messages].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))

  const markRead = async (id: string) => {
    if (busyId) return
    setBusyId(id)
    try { await repository.markMessageRead(id); showToast('Message marked as read.', 'info') }
    catch (reason) { showToast(errorMessage(reason, 'Could not mark the message as read.'), 'error') }
    finally { setBusyId(null) }
  }
  const deleteMessage = async () => {
    if (!deleteId || busyId) return
    setBusyId(deleteId)
    try { await repository.deleteMessage(deleteId); setDeleteId(null); showToast('Message deleted.', 'info') }
    catch (reason) { showToast(errorMessage(reason, 'Could not delete the message.'), 'error') }
    finally { setBusyId(null) }
  }

  return <>
    <PageHeader eyebrow="Inbox / Contact messages" title="Messages" description={repository.mode === 'local' ? 'Contact-form submissions stored in this browser’s local workspace.' : 'Protected contact-form submissions available only to authenticated administrators.'} />
    {messages.length === 0 ? <EmptyState title="No messages yet" description="New public contact-form submissions will appear here." /> : <div className="message-list">{messages.map((message) => <article className={`message-card ${message.read ? '' : 'is-unread'}`} key={message.id}><div className="message-top"><div><strong>{message.sender}</strong><span>{message.email}</span></div><span>{new Date(message.submittedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div><p className="message-body">{message.message}</p><div className="message-actions">{!message.read && <button type="button" onClick={() => markRead(message.id)} disabled={Boolean(busyId)}><AdminIcon name="check" size={13} /> {busyId === message.id ? 'Updating…' : 'Mark read'}</button>}<button type="button" onClick={() => { window.location.href = `mailto:${message.email}` }} disabled={Boolean(busyId)}>Reply by email</button><button type="button" onClick={() => setDeleteId(message.id)} disabled={Boolean(busyId)}>Delete</button></div></article>)}</div>}
    <ConfirmDialog open={Boolean(deleteId)} title="Delete this message?" description="It will be permanently removed from the repository." confirmLabel={busyId === deleteId ? 'Deleting…' : 'Delete message'} danger onConfirm={deleteMessage} onCancel={() => { if (!busyId) setDeleteId(null) }} busy={busyId === deleteId} />
  </>
}
