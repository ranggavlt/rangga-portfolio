import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { PortfolioData, PortfolioRepository } from '../domain/types'

export type PortfolioContextValue = {
  data: PortfolioData
  repository: PortfolioRepository
  loading: boolean
  error: string | null
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

export function PortfolioProvider({ repository, children }: { repository: PortfolioRepository; children: ReactNode }) {
  const [data, setData] = useState<PortfolioData>(repository.getSnapshot())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Subscribe to in-memory snapshot updates (synchronous, keeps UI reactive)
  useEffect(() => repository.subscribe(setData), [repository])

  // Call initialize() once on mount so async adapters (e.g. Supabase) can
  // hydrate the snapshot before rendering. For LocalPortfolioRepository this
  // resolves immediately; future adapters will await a real fetch.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    repository.initialize()
      .then(() => { if (!cancelled) setLoading(false) })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load portfolio data.')
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [repository])

  const value = useMemo(() => ({ data, repository, loading, error }), [data, repository, loading, error])
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) throw new Error('usePortfolio must be used inside PortfolioProvider')
  return context
}
