import { Link, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import App from './App'
import { useAuth } from './auth/AuthProvider'
import { AdminLayout } from './admin/components/AdminUI'
import LoginPage from './admin/pages/LoginPage'
import DashboardPage from './admin/pages/DashboardPage'
import ProjectsPage from './admin/pages/ProjectsPage'
import ProjectFormPage from './admin/pages/ProjectFormPage'
import ExperiencePage from './admin/pages/ExperiencePage'
import EducationPage from './admin/pages/EducationPage'
import OrganizationsPage from './admin/pages/OrganizationsPage'
import SkillsPage from './admin/pages/SkillsPage'
import ProfilePage from './admin/pages/ProfilePage'
import SocialLinksPage from './admin/pages/SocialLinksPage'
import MessagesPage from './admin/pages/MessagesPage'
import PublicProjectPlaceholder from './pages/PublicProjectPlaceholder'
import NotFoundPage from './pages/NotFoundPage'

function ProtectedAdminRoute() {
  const { session } = useAuth()
  return session ? <Outlet /> : <Navigate to="/admin/login" replace />
}

function AdminNotFound() {
  return <div className="admin-not-found"><div className="admin-eyebrow">Admin / 404</div><h1>Unknown admin page.</h1><p>This route is not part of the local demo workspace.</p><Link className="admin-button button-dark" to="/admin">Back to overview</Link></div>
}

export function PortfolioRouter() {
  return <Routes>
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
        <Route path="skills" element={<SkillsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="social-links" element={<SocialLinksPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="*" element={<AdminNotFound />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
}
