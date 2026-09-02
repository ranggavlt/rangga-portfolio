import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { DemoAuthService } from './auth/authService'
import { SupabaseAuthService } from './auth/supabaseAuthService'
import { supabase } from './lib/supabase'
import { PortfolioRouter } from './router'
import { LocalPortfolioRepository } from './repository/localPortfolioRepository'
import { PortfolioProvider } from './repository/PortfolioProvider'
import { SupabasePortfolioRepository } from './repository/supabasePortfolioRepository'

const repository = supabase ? new SupabasePortfolioRepository(supabase) : new LocalPortfolioRepository()
const authService = supabase ? new SupabaseAuthService(supabase) : new DemoAuthService()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PortfolioProvider repository={repository}>
        <AuthProvider service={authService} onSessionChange={() => repository.refresh()}>
          <PortfolioRouter />
        </AuthProvider>
      </PortfolioProvider>
    </BrowserRouter>
  </StrictMode>,
)
