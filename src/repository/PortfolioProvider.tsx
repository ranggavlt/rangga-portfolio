import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { PortfolioData, PortfolioRepository } from '../domain/types'

export type PortfolioContextValue = {
  data: PortfolioData
  repository: PortfolioRepository
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null)

export function PortfolioProvider({ repository, children }: { repository: PortfolioRepository; children: ReactNode }) {
  const [data, setData] = useState(repository.getSnapshot())

  useEffect(() => repository.subscribe(setData), [repository])

  const value = useMemo(() => ({ data, repository }), [data, repository])
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) throw new Error('usePortfolio must be used inside PortfolioProvider')
  return context
}
