import { SupabaseClient } from '@supabase/supabase-js'
import {
  CertificateEntry, ContactMessage, EducationEntry, ExperienceEntry, OrganizationEntry, PortfolioData, PortfolioProject,
  PortfolioRepository, Profile, ProjectImage, ReorderableSection, RepositoryListener, SkillGroup, SocialLink,
} from '../domain/types'
import { Database, CertificateRow, EducationRow, ExperienceRow, OrganizationRow, ProfileRow, ProjectImageRow, ProjectRow, SkillRow, SocialLinkRow, ContactMessageRow } from '../lib/database.types'
import { createSeedPortfolioData } from './seed'

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const byOrder = <T extends { displayOrder: number }>(items: T[]) => [...items].sort((a, b) => a.displayOrder - b.displayOrder)
const defaultPortraitUrl = '/aboutme.jpeg'
const legacyPortraitUrl = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1100&q=86'

const migrationError = (message: string, phase: 4 | 5 | 6, fallback: string) => {
  const normalized = message.toLowerCase()
  if (normalized.includes('schema cache') || normalized.includes('does not exist') || normalized.includes('could not find the function')) {
    return new Error(`${fallback}: the required Phase ${phase} Supabase migration is not applied. Run the committed migration in the Supabase Dashboard and try again.`)
  }
  return new Error(`${fallback}: ${message}`)
}

const projectFromRow = (row: ProjectRow, images: ProjectImageRow[]): PortfolioProject => ({
  id: row.id, slug: row.slug, title: row.title, year: row.year, category: row.category,
  shortDescription: row.short_description, fullDescription: row.full_description, role: row.role,
  tech: row.tech ?? [], liveUrl: row.live_url, sourceUrl: row.source_url,
  published: row.status === 'published', displayOrder: row.display_order, updatedAt: row.updated_at,
  images: images.filter((image) => image.project_id === row.id).sort((a, b) => a.position - b.position).map((image) => ({
    id: image.id, src: image.src, storagePath: image.storage_path ?? null, alt: image.alt, caption: image.caption, position: image.position as ProjectImage['position'],
  })) as PortfolioProject['images'],
})

const profileFromRow = (row: ProfileRow): Profile => ({
  fullName: row.full_name, professionalTitle: row.professional_title, heroEyebrow: row.hero_eyebrow,
  heroHeading: row.hero_heading, heroDescription: row.hero_description, aboutHeading: row.about_heading,
  aboutBiography: row.about_biography, aboutSecondary: row.about_secondary, location: row.location,
  availabilityText: row.availability_text, email: row.email,
  // Existing Supabase installations keep their original seed value after a deploy.
  // Use the checked-in portrait until the profile is explicitly updated in admin.
  portraitUrl: row.portrait_url === legacyPortraitUrl ? defaultPortraitUrl : row.portrait_url,
  portraitStoragePath: row.portrait_storage_path ?? null, cvUrl: row.cv_url, cvStoragePath: row.cv_storage_path ?? null,
  footerText: row.footer_text,
  whatsappNumber: row.whatsapp_number ?? '', whatsappMessage: row.whatsapp_message ?? '',
})

export class SupabasePortfolioRepository implements PortfolioRepository {
  readonly mode = 'supabase' as const
  private data: PortfolioData = createSeedPortfolioData()
  private listeners = new Set<RepositoryListener>()

  constructor(private readonly client: SupabaseClient<Database>) {}

  async initialize() { await this.refresh() }

  async refresh() {
    const publicDataPromise = Promise.all([
      this.read('projects', 'id, slug, title, year, category, short_description, full_description, role, tech, live_url, source_url, status, display_order, updated_at'),
      this.read('project_images', 'id, project_id, src, storage_path, alt, caption, position'),
      this.read('profiles', 'id, full_name, professional_title, hero_eyebrow, hero_heading, hero_description, about_heading, about_biography, about_secondary, location, availability_text, email, portrait_url, portrait_storage_path, cv_url, cv_storage_path, footer_text, whatsapp_number, whatsapp_message'),
      this.read('experiences', 'id, period, company, role, description, published, display_order'),
      this.read('education', 'id, period, institution, degree, detail, display_order'),
      this.read('organizations', 'id, name, meta, detail, published, display_order'),
      this.read('certificates', 'id, name, issuer, issued_on, verification_url, credential_id, proof_url, proof_storage_path, published, display_order'),
      this.read('skills', 'id, label, skills, display_order'),
      this.read('social_links', 'id, platform, url, display_order, enabled'),
    ])
    const [{ data: authData, error: authError }, publicData] = await Promise.all([
      this.client.auth.getSession(),
      publicDataPromise,
    ])
    if (authError) {
      this.clearMessages()
      throw new Error(`Could not inspect the Supabase session while refreshing portfolio data: ${authError.message}`)
    }

    const [projects, images, profile, experience, education, organizations, certificates, skills, socialLinks] = publicData
    let messages: unknown[] = []
    if (authData.session) {
      try { messages = await this.read('contact_messages', 'id, sender, email, message, submitted_at, read') }
      catch (error) { this.clearMessages(); throw error }
    }
    const seed = createSeedPortfolioData()
    this.data = {
      projects: (projects as unknown as ProjectRow[]).map((project) => projectFromRow(project, images as unknown as ProjectImageRow[])),
      profile: (profile as unknown as ProfileRow[])[0] ? profileFromRow((profile as unknown as ProfileRow[])[0]) : seed.profile,
      experience: (experience as unknown as ExperienceRow[]).map((row) => ({ id: row.id, period: row.period, company: row.company, role: row.role, description: row.description, published: row.published, displayOrder: row.display_order })),
      education: (education as unknown as EducationRow[]).map((row) => ({ id: row.id, period: row.period, institution: row.institution, degree: row.degree, detail: row.detail, displayOrder: row.display_order })),
      organizations: (organizations as unknown as OrganizationRow[]).map((row) => ({ id: row.id, name: row.name, meta: row.meta, detail: row.detail, published: row.published, displayOrder: row.display_order })),
      certificates: (certificates as unknown as CertificateRow[]).map((row) => ({ id: row.id, name: row.name, issuer: row.issuer, issuedOn: row.issued_on, verificationUrl: row.verification_url, credentialId: row.credential_id, proofUrl: row.proof_url, proofStoragePath: row.proof_storage_path, published: row.published, displayOrder: row.display_order })),
      skills: (skills as unknown as SkillRow[]).map((row) => ({ id: row.id, label: row.label, skills: row.skills ?? [], displayOrder: row.display_order })),
      socialLinks: (socialLinks as unknown as SocialLinkRow[]).map((row) => ({ id: row.id, platform: row.platform, url: row.url, displayOrder: row.display_order, enabled: row.enabled })),
      messages: (messages as ContactMessageRow[]).map((row) => ({ id: row.id, sender: row.sender, email: row.email, message: row.message, submittedAt: row.submitted_at, read: row.read })),
    }
    this.emit()
  }

  getSnapshot() { return clone(this.data) }
  subscribe(listener: RepositoryListener) { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  async reset() { throw new Error('Reset is available only in LocalStorage demo mode.') }
  async reorderItems(section: ReorderableSection, orderedIds: string[]) {
    if (section === 'certificates') {
      const { error } = await this.client.rpc('reorder_certificates', { p_ordered_ids: orderedIds })
      if (error) throw migrationError(error.message, 6, 'Could not update certificate order')
      await this.refresh()
      return
    }
    const sectionMap: Record<ReorderableSection, 'experience' | 'education' | 'organizations' | 'certificates' | 'skills' | 'social_links'> = {
      experience: 'experience', education: 'education', organizations: 'organizations', certificates: 'certificates', skills: 'skills', socialLinks: 'social_links',
    }
    const { error } = await this.client.rpc('reorder_portfolio_items', { p_section: sectionMap[section], p_ordered_ids: orderedIds })
    if (error) throw migrationError(error.message, 5, 'Could not update display order')
    await this.refresh()
  }

  getProjects() { return byOrder(this.data.projects) }
  getProject(id: string) { return this.data.projects.find((project) => project.id === id) }
  getProjectImages(projectId: string) { return clone(this.getProject(projectId)?.images ?? []) }

  async saveProject(project: PortfolioProject) {
    this.assertThreeImages(project.images)
    const existing = this.data.projects.some((item) => item.id === project.id)
    const { error } = await this.client.rpc('save_project_with_images', {
      p_project_id: existing ? project.id : null,
      p_slug: project.slug,
      p_title: project.title,
      p_year: project.year,
      p_category: project.category,
      p_short_description: project.shortDescription,
      p_full_description: project.fullDescription,
      p_role: project.role,
      p_tech: project.tech,
      p_live_url: project.liveUrl,
      p_source_url: project.sourceUrl,
      p_status: project.published ? 'published' : 'draft',
      p_display_order: project.displayOrder,
      p_images: project.images.map((image) => ({ src: image.src, storage_path: image.storagePath ?? null, alt: image.alt, caption: image.caption, position: image.position })),
    })
    if (error) throw migrationError(error.message, 4, 'Could not save project')
    await this.refresh()
  }

  async deleteProject(id: string) { await this.remove('projects', id, 'project'); await this.refresh() }
  async updateProjectImages(projectId: string, images: [ProjectImage, ProjectImage, ProjectImage]) {
    const project = this.getProject(projectId)
    if (!project) throw new Error('Could not update images because the project was not found.')
    await this.saveProject({ ...project, images })
  }

  getExperience() { return byOrder(this.data.experience) }
  async saveExperience(entry: ExperienceEntry) { await this.saveOrdered('experiences', entry.id, this.data.experience.some((x) => x.id === entry.id), { period: entry.period, company: entry.company, role: entry.role, description: entry.description, published: entry.published, display_order: entry.displayOrder }, 'experience'); await this.refresh() }
  async deleteExperience(id: string) { await this.remove('experiences', id, 'experience'); await this.refresh() }

  getEducation() { return byOrder(this.data.education) }
  async saveEducation(entry: EducationEntry) { await this.saveOrdered('education', entry.id, this.data.education.some((x) => x.id === entry.id), { period: entry.period, institution: entry.institution, degree: entry.degree, detail: entry.detail, display_order: entry.displayOrder }, 'education'); await this.refresh() }
  async deleteEducation(id: string) { await this.remove('education', id, 'education'); await this.refresh() }

  getOrganizations() { return byOrder(this.data.organizations) }
  async saveOrganization(entry: OrganizationEntry) { await this.saveOrdered('organizations', entry.id, this.data.organizations.some((x) => x.id === entry.id), { name: entry.name, meta: entry.meta, detail: entry.detail, published: entry.published, display_order: entry.displayOrder }, 'organization'); await this.refresh() }
  async deleteOrganization(id: string) { await this.remove('organizations', id, 'organization'); await this.refresh() }

  getCertificates() { return byOrder(this.data.certificates) }
  async saveCertificate(entry: CertificateEntry) { await this.saveOrdered('certificates', entry.id, this.data.certificates.some((x) => x.id === entry.id), { name: entry.name, issuer: entry.issuer, issued_on: entry.issuedOn, verification_url: entry.verificationUrl, credential_id: entry.credentialId, proof_url: entry.proofUrl, proof_storage_path: entry.proofStoragePath, published: entry.published, display_order: entry.displayOrder }, 'certificate'); await this.refresh() }
  async deleteCertificate(id: string) { await this.remove('certificates', id, 'certificate'); await this.refresh() }

  getSkills() { return byOrder(this.data.skills) }
  async saveSkillGroup(group: SkillGroup) { await this.saveOrdered('skills', group.id, this.data.skills.some((x) => x.id === group.id), { label: group.label, skills: group.skills, display_order: group.displayOrder }, 'skill group'); await this.refresh() }
  async deleteSkillGroup(id: string) { await this.remove('skills', id, 'skill group'); await this.refresh() }

  getProfile() { return clone(this.data.profile) }
  async saveProfile(profile: Profile) {
    const payload = { full_name: profile.fullName, professional_title: profile.professionalTitle, hero_eyebrow: profile.heroEyebrow, hero_heading: profile.heroHeading, hero_description: profile.heroDescription, about_heading: profile.aboutHeading, about_biography: profile.aboutBiography, about_secondary: profile.aboutSecondary, location: profile.location, availability_text: profile.availabilityText, email: profile.email, portrait_url: profile.portraitUrl, portrait_storage_path: profile.portraitStoragePath ?? null, cv_url: profile.cvUrl, cv_storage_path: profile.cvStoragePath ?? null, footer_text: profile.footerText, whatsapp_number: profile.whatsappNumber, whatsapp_message: profile.whatsappMessage }
    const { data: current, error: readError } = await this.client.from('profiles').select('id').limit(1).maybeSingle()
    if (readError) throw new Error(`Could not locate the profile: ${readError.message}`)
    const { error } = current ? await this.client.from('profiles').update(payload).eq('id', current.id) : await this.client.from('profiles').insert(payload)
    if (error) throw migrationError(error.message, 6, 'Could not save profile')
    await this.refresh()
  }

  getSocialLinks() { return byOrder(this.data.socialLinks) }
  async saveSocialLink(link: SocialLink) { await this.saveOrdered('social_links', link.id, this.data.socialLinks.some((x) => x.id === link.id), { platform: link.platform, url: link.url, display_order: link.displayOrder, enabled: link.enabled }, 'social link'); await this.refresh() }
  async deleteSocialLink(id: string) { await this.remove('social_links', id, 'social link'); await this.refresh() }

  getMessages() { return [...this.data.messages].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)) }
  async addMessage(message: ContactMessage) {
    const { error } = await this.client.from('contact_messages').insert({ sender: message.sender, email: message.email, message: message.message, submitted_at: message.submittedAt })
    if (error) throw new Error(`Could not send message: ${error.message}`)
  }
  async markMessageRead(id: string) { const { error } = await this.client.from('contact_messages').update({ read: true }).eq('id', id); if (error) throw new Error(`Could not mark message as read: ${error.message}`); await this.refresh() }
  async deleteMessage(id: string) { await this.remove('contact_messages', id, 'message'); await this.refresh() }

  private async read(table: keyof Database['public']['Tables'], columns = '*') {
    const { data, error } = await this.client.from(table).select(columns)
    if (error) throw table === 'certificates' || table === 'profiles'
      ? migrationError(error.message, 6, `Could not load ${table}`)
      : new Error(`Could not load ${table}: ${error.message}`)
    return data ?? []
  }

  private async saveOrdered(table: 'experiences' | 'education' | 'organizations' | 'certificates' | 'skills' | 'social_links', id: string, existing: boolean, payload: object, label: string) {
    const values = payload as never
    const { error } = existing ? await this.client.from(table).update(values).eq('id', id) : await this.client.from(table).insert(values)
    if (error) throw table === 'certificates'
      ? migrationError(error.message, 6, `Could not save ${label}`)
      : new Error(`Could not save ${label}: ${error.message}`)
  }

  private async remove(table: 'projects' | 'experiences' | 'education' | 'organizations' | 'certificates' | 'skills' | 'social_links' | 'contact_messages', id: string, label: string) {
    const { error } = await this.client.from(table).delete().eq('id', id)
    if (error) throw new Error(`Could not delete ${label}: ${error.message}`)
  }

  private assertThreeImages(images: ProjectImage[]): asserts images is [ProjectImage, ProjectImage, ProjectImage] {
    if (images.length !== 3 || new Set(images.map((image) => image.position)).size !== 3 || images.some((image) => image.position < 1 || image.position > 3)) {
      throw new Error('Each project must have exactly three images in positions 1, 2, and 3.')
    }
  }

  private clearMessages() {
    if (!this.data.messages.length) return
    this.data = { ...this.data, messages: [] }
    this.emit()
  }

  private emit() { this.listeners.forEach((listener) => listener(this.getSnapshot())) }
}
