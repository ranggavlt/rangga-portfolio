import { lazy, Suspense } from 'react'
import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import App from './App'
import { useAuth } from './auth/AuthProvider'
import PublicProjectPlaceholder from './pages/PublicProjectPlaceholder'
import NotFoundPage from './pages/NotFoundPage'
import { PublicScrollManager } from './publicScroll'
import { WhatsAppButton } from './components/WhatsAppButton'

const AdminLayout = lazy(() => import('./admin/components/AdminUI').then((module) => ({ default: module.AdminLayout })))
const LoginPage = lazy(() => import('./admin/pages/LoginPage'))
const DashboardPage = lazy(() => import('./admin/pages/DashboardPage'))
const ProjectsPage = lazy(() => import('./admin/pages/ProjectsPage'))
const ProjectFormPage = lazy(() => import('./admin/pages/ProjectFormPage'))
const ExperiencePage = lazy(() => import('./admin/pages/ExperiencePage'))
const EducationPage = lazy(() => import('./admin/pages/EducationPage'))
const OrganizationsPage = lazy(() => import('./admin/pages/OrganizationsPage'))
const CertificatesPage = lazy(() => import('./admin/pages/CertificatesPage'))
const SkillsPage = lazy(() => import('./admin/pages/SkillsPage'))
const ProfilePage = lazy(() => import('./admin/pages/ProfilePage'))
const SocialLinksPage = lazy(() => import('./admin/pages/SocialLinksPage'))
const MessagesPage = lazy(() => import('./admin/pages/MessagesPage'))

function ProtectedAdminRoute() {
  const { session, loading, error } = useAuth()
  if (loading) return <div className="admin-loading" role="status">Checking administrator access…</div>
  if (error) return <div className="login-screen"><div className="login-card"><div className="admin-error" role="alert">{error}</div><Link className="admin-link" to="/admin/login">Return to sign in</Link></div></div>
  return session ? <Outlet /> : <Navigate to="/admin/login" replace />
}

function AdminNotFound() {
  return <div className="admin-not-found"><div className="admin-eyebrow">Admin / 404</div><h1>Unknown admin page.</h1><p>This route is not part of the portfolio admin workspace.</p><Link className="admin-button button-dark" to="/admin">Back to overview</Link></div>
}

export function PortfolioRouter() {
  return <><PublicScrollManager /><Suspense fallback={<div className="route-loading" role="status">Loading page…</div>}><Routes>
    <Route path="/" element={<App />} />
    <Route path="/projects/:slug" element={<PublicProjectPlaceholder />} />
    <Route path="/admin/login" element={<LoginPage />} />
    <Route path="/admin" element={<ProtectedAdminRoute />}>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/new" element={<ProjectFormPage />} />
        <Route path="projects/:id/edit" element={<ProjectFormPage />} />
        <Route path="experience" element={<ExperiencePage />} />
        <Route path="education" element={<EducationPage />} />
        <Route path="organizations" element={<OrganizationsPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="social-links" element={<SocialLinksPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="*" element={<AdminNotFound />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes><WhatsAppButton /></Suspense></>
}
