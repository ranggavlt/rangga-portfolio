import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { whatsAppUrl } from '../lib/whatsapp'
import { usePortfolio } from '../repository/PortfolioProvider'

export function WhatsAppButton() {
  const { data, loading } = usePortfolio()
  const location = useLocation()
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const [obscured, setObscured] = useState(false)
  const url = whatsAppUrl(data.profile.whatsappNumber, data.profile.whatsappMessage)
  const publicPage = location.pathname === '/' || location.pathname.startsWith('/projects/')

  useEffect(() => {
    if (!url || !publicPage || loading) return
    let frame = 0
    const check = () => {
      frame = 0
      const button = buttonRef.current
      if (!button) return
      const box = button.getBoundingClientRect()
      const menuOpen = Boolean(document.querySelector('.desktop-nav.mobile-open'))
      const controls = document.querySelectorAll<HTMLElement>('.app-shell a, .app-shell button, .app-shell input, .app-shell textarea, .case-study a, .case-study button')
      const collides = [...controls].some((control) => {
        const rect = control.getBoundingClientRect()
        return rect.width > 0 && rect.height > 0 && rect.left < box.right + 6 && rect.right > box.left - 6 && rect.top < box.bottom + 6 && rect.bottom > box.top - 6
      })
      setObscured(menuOpen || collides)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(check) }
    const nav = document.querySelector('.desktop-nav')
    const observer = new MutationObserver(schedule)
    if (nav) observer.observe(nav, { attributes: true, attributeFilter: ['class'] })
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [url, publicPage, location.pathname, loading])

  if (!url || !publicPage || loading) return null
  return <a ref={buttonRef} className={`whatsapp-button ${obscured ? 'is-obscured' : ''}`} href={url} target="_blank" rel="noopener noreferrer" aria-label="Chat via WhatsApp" aria-hidden={obscured || undefined} tabIndex={obscured ? -1 : undefined}>
    <svg viewBox="0 0 32 32" width="25" height="25" fill="none" aria-hidden="true"><path d="M16 3.6a12.3 12.3 0 0 0-10.6 18.5L3.5 29l7.1-1.9A12.3 12.3 0 1 0 16 3.6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M11.2 9.7c-.5-.2-1.1-.1-1.5.4-.8.9-1.2 2.2-.5 4.2 1.2 3.3 4.4 6.1 7.8 7.2 1.9.6 3.3.3 4.2-.5.5-.4.8-1.2.7-2l-3.2-1.5-1.7 1.7c-2.2-.9-3.7-2.4-4.8-4.5l1.5-1.6-1.5-3.6Z" fill="currentColor"/></svg>
  </a>
}
