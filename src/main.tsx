import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { DemoAuthService } from './auth/authService'
import { PortfolioRouter } from './router'
import { LocalPortfolioRepository } from './repository/localPortfolioRepository'
import { PortfolioProvider } from './repository/PortfolioProvider'

const repository = new LocalPortfolioRepository()
const authService = new DemoAuthService()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PortfolioProvider repository={repository}>
        <AuthProvider service={authService}>
          <PortfolioRouter />
        </AuthProvider>
      </PortfolioProvider>
    </BrowserRouter>
  </StrictMode>,
)
