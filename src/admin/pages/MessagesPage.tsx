import { useState } from 'react'
import { usePortfolio } from '../../repository/PortfolioProvider'
import { AdminIcon, ConfirmDialog, EmptyState, PageHeader, useToast } from '../components/AdminUI'

export default function MessagesPage() {
  const { data, repository } = usePortfolio()
  const { showToast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const messages = [...data.messages].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
  const markRead = (id: string) => { repository.markMessageRead(id); showToast('Message marked as read.', 'info') }
  const deleteMessage = () => { if (!deleteId) return; repository.deleteMessage(deleteId); setDeleteId(null); showToast('Message deleted from the local demo.', 'info') }
  return <>
    <PageHeader eyebrow="Inbox / Contact messages" title="Messages" description="Local submissions from the public contact form. This inbox will be replaced by Supabase in production." />
    {messages.length === 0 ? <EmptyState title="No messages yet" description="When someone submits the public contact form, their message will appear here in this browser." /> : <div className="message-list">{messages.map((message) => <article className={`message-card ${message.read ? '' : 'is-unread'}`} key={message.id}><div className="message-top"><div><strong>{message.sender}</strong><span>{message.email}</span></div><span>{new Date(message.submittedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div><p className="message-body">{message.message}</p><div className="message-actions">{!message.read && <button type="button" onClick={() => markRead(message.id)}><AdminIcon name="check" size={13} /> Mark read</button>}<button type="button" onClick={() => window.location.href = `mailto:${message.email}`} >Reply by email</button><button type="button" onClick={() => setDeleteId(message.id)}>Delete</button></div></article>)}</div>}
    <ConfirmDialog open={Boolean(deleteId)} title="Delete this message?" description="It will be removed from the local demo repository and cannot be recovered without a reset." confirmLabel="Delete message" danger onConfirm={deleteMessage} onCancel={() => setDeleteId(null)} />
  </>
}
