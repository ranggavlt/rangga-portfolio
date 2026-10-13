# Rangga Ariansyah — Portfolio + Admin UI

A monochrome editorial portfolio for Rangga Ariansyah, extended with a frontend-only administration interface. The public page and admin UI share one typed local repository so local edits are visible immediately on `/`.

## Requirements

- Node.js 20+ (Node 24 recommended)
- pnpm 11+

## Installation

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Then open the local Vite URL printed in the terminal.

## Production build

```bash
pnpm run build
pnpm run preview
```

`pnpm run build` runs the strict TypeScript project build followed by the Vite production build.

## Routes

### Public

- `/` — existing responsive portfolio page
- `/projects/:slug` — prepared placeholder route for future project case studies

### Admin

- `/admin/login` — demo login
- `/admin` — dashboard overview
- `/admin/projects` — project list, search, filtering, sorting, create/edit/delete
- `/admin/projects/new` — new project form
- `/admin/projects/:id/edit` — project editor
- `/admin/experience`
- `/admin/education`
- `/admin/organizations`
- `/admin/skills`
- `/admin/profile`
- `/admin/social-links`
- `/admin/messages`

Unknown admin routes render an admin-specific 404 state. Unknown public routes render a public 404 state.

## Demo admin login

This is intentionally a frontend preview and is **not production authentication**.

- Email: `demo@rangga.dev`
- Password: `demo`

The demo session is stored locally under `rangga-portfolio-demo-auth-v1`. Authentication is isolated behind `AuthService`, `DemoAuthService`, `AuthProvider`, and `useAuth`. A future Supabase Auth implementation can replace `DemoAuthService` without rewriting the admin pages.

## Local repository

All portfolio content is read and written through `PortfolioRepository`.

- Domain types: `src/domain/types.ts`
- Repository contract: `PortfolioRepository` in `src/domain/types.ts`
- Local adapter: `src/repository/localPortfolioRepository.ts`
- Seed mapping from the original public content: `src/repository/seed.ts`
- React context: `src/repository/PortfolioProvider.tsx`

The local adapter uses the namespaced key:

```text
rangga-portfolio-demo-v1
```

The public portfolio and admin UI consume the same repository instance, so changing profile, project, skills, social links, or other content in admin updates the public route immediately in the same browser.

The admin sidebar includes **Reset demo data**, which restores the original public portfolio seed after confirmation.

LocalStorage is only for local visual testing. It is not the production database, is not suitable for multi-user persistence, and does not replace backend validation. The future production adapter should implement the same repository contract with Supabase tables and Supabase Storage.

## Contact messages

The public contact form adds messages to the local repository. Admin `/admin/messages` can view, mark read, reply by email, and delete those messages.

This is explicitly local demo behavior. It will be replaced by a Supabase-backed message flow during backend integration.

## Project gallery images

Projects always contain exactly three gallery image records. The admin editor supports:

- Image URL
- Supabase Storage upload on save
- Alt text
- Caption
- Replace upload for each of the three fixed slots
- Reset preview

Local-file previews use `URL.createObjectURL` in memory only. In Supabase mode, Save Project uploads the selected JPEG, PNG, or WebP file to the public `portfolio-images` bucket and persists its public URL plus storage path in the matching `project_images` slot. Image binaries and Base64 content are never stored in localStorage.

For a deployed build, set both `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the hosting environment before building, and apply `supabase/migrations/202609020004_phase4_storage.sql`. If the editor shows **Supabase required**, that build is running in local demo mode and cannot upload files.

## Not implemented intentionally

- Vercel configuration
- Real authentication
- API keys or secrets
- Production publishing
- Database-backed message delivery

## Structure

```text
src/
  auth/                       AuthService interface + demo auth provider
  admin/
    components/               Admin layout, controls, toasts, dialogs, CSS
    pages/                    Dashboard and content management pages
  domain/                     Shared domain types
  pages/                      Public case-study placeholder and 404
  repository/                 Repository interface implementation + seed
  App.tsx                     Existing public portfolio, repository-backed
  data.ts                     Original centralized public seed content
  router.tsx                  React Router route tree
  main.tsx                    Providers and router entry point
```

## Changelog

### Added

- React Router with public, case-study placeholder, admin, and 404 routes
- Local `PortfolioRepository` abstraction and `LocalPortfolioRepository` implementation
- Shared `PortfolioProvider` for public/admin synchronization
- Isolated `AuthService` interface and clearly labeled demo login
- Responsive admin sidebar, top bar, mobile drawer, breadcrumbs, toasts, loading/error/empty states, and confirmation dialogs
- Admin dashboard with project/message overview
- Project management table with search, status filter, sorting, responsive mobile cards, delete confirmation, and create/edit forms
- Exactly-three-image project editor with temporary local preview controls
- Experience, education, organization, skills, profile, social-link, and message management pages
- Public contact form persistence to the local demo repository
- README documentation for local demo and future Supabase integration

### Modified

- `src/App.tsx` now reads public content through `usePortfolio()` while preserving its existing visual design, motion system, sticky galleries, responsive CSS, accessibility, and reduced-motion behavior
- `src/main.tsx` now mounts the router and shared repository/auth providers
- `package.json` and `pnpm-lock.yaml` now include exact dependency versions and `react-router-dom`
- `src/styles.css` receives only route-placeholder styling; the existing portfolio visual system remains intact

### Verification performed

- `pnpm install`
- `pnpm run build`

No production deployment or backend connection was performed.
