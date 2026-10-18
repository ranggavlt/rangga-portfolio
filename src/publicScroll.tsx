import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

let portfolioScrollY: number | null = null

export function rememberPortfolioScroll() {
  portfolioScrollY = window.scrollY
}

function scrollImmediately(top: number) {
  const root = document.documentElement
  const previousBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo(0, top)
  root.style.scrollBehavior = previousBehavior
}

export function PublicScrollManager() {
  const { pathname } = useLocation()
  const previousPath = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (pathname.startsWith('/projects/')) {
      scrollImmediately(0)
    } else if (pathname === '/' && previousPath.current?.startsWith('/projects/')) {
      scrollImmediately(portfolioScrollY ?? 0)
    }
    previousPath.current = pathname
  }, [pathname])

  return null
}
