import {
  ContactMessage,
  EducationEntry,
  ExperienceEntry,
  OrganizationEntry,
  PortfolioData,
  PortfolioProject,
  PortfolioRepository,
  Profile,
  ProjectImage,
  RepositoryListener,
  ReorderableSection,
  SkillGroup,
  SocialLink,
} from '../domain/types'
import { createSeedPortfolioData } from './seed'

export const DEMO_STORAGE_KEY = 'rangga-portfolio-demo-v1'

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const orderByDisplay = <T extends { displayOrder: number }>(items: T[]) => [...items].sort((a, b) => a.displayOrder - b.displayOrder)
const stamp = () => new Date().toISOString()

export class LocalPortfolioRepository implements PortfolioRepository {
  readonly mode = 'local' as const
  private data: PortfolioData
  private listeners = new Set<RepositoryListener>()

  constructor() {
    this.data = this.read()
  }

  private read(): PortfolioData {
    if (typeof window === 'undefined') return createSeedPortfolioData()
    const stored = window.localStorage.getItem(DEMO_STORAGE_KEY)
    if (!stored) {
      const seed = createSeedPortfolioData()
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seed))
      return seed
    }
    try {
      return this.normalize(JSON.parse(stored) as PortfolioData)
    } catch {
      const seed = createSeedPortfolioData()
      window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seed))
      return seed
    }
  }

  private normalize(data: PortfolioData): PortfolioData {
    const seed = createSeedPortfolioData()
    return {
      ...seed,
      ...data,
      projects: Array.isArray(data.projects) ? data.projects.map((project) => ({
        ...project,
        images: project.images.map((image) => ({ storagePath: null, ...image })) as PortfolioProject['images'],
      })) : seed.projects,
      experience: Array.isArray(data.experience) ? data.experience : seed.experience,
      education: Array.isArray(data.education) ? data.education : seed.education,
      organizations: Array.isArray(data.organizations) ? data.organizations : seed.organizations,
      skills: Array.isArray(data.skills) ? data.skills : seed.skills,
      socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : seed.socialLinks,
      messages: Array.isArray(data.messages) ? data.messages : [],
      profile: { ...seed.profile, ...(data.profile ?? {}) },
    }
  }

  private commit(next: PortfolioData) {
    this.data = clone(next)
    if (typeof window !== 'undefined') window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(this.data))
    this.listeners.forEach((listener) => listener(this.getSnapshot()))
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  // For LocalPortfolioRepository the constructor already hydrates from storage,
  // so initialize/refresh are trivially instant. A future SupabaseRepository
  // will replace these with real async fetches.
  async initialize(): Promise<void> { this.data = this.read() }
  async refresh(): Promise<void> { this.data = this.read(); this.listeners.forEach((listener) => listener(this.getSnapshot())) }
  async reorderItems(section: ReorderableSection, orderedIds: string[]): Promise<void> {
    const key = section === 'socialLinks' ? 'socialLinks' : section
    const items = this.data[key]
    const currentIds = items.map((item) => item.id)
    if (orderedIds.length !== currentIds.length || new Set(orderedIds).size !== orderedIds.length || currentIds.some((id) => !orderedIds.includes(id))) {
      throw new Error('Could not reorder items because the list changed. Refresh and try again.')
    }
    const order = new Map(orderedIds.map((id, index) => [id, index + 1]))
    this.commit({ ...this.data, [key]: items.map((item) => ({ ...item, displayOrder: order.get(item.id) ?? item.displayOrder })) })
  }

  // ── Synchronous reads ──────────────────────────────────────────────────────
  getSnapshot() { return clone(this.data) }
  subscribe(listener: RepositoryListener) { this.listeners.add(listener); return () => this.listeners.delete(listener) }

  // ── Reset ──────────────────────────────────────────────────────────────────
  async reset(): Promise<void> { this.commit(createSeedPortfolioData()) }

  // ── Projects ───────────────────────────────────────────────────────────────
  getProjects() { return orderByDisplay(this.data.projects) }
  getProject(id: string) { return this.data.projects.find((project) => project.id === id) }
  async saveProject(project: PortfolioProject): Promise<void> {
    const next = this.data.projects.some((item) => item.id === project.id)
      ? this.data.projects.map((item) => item.id === project.id ? { ...project, updatedAt: stamp() } : item)
      : [...this.data.projects, { ...project, updatedAt: stamp() }]
    this.commit({ ...this.data, projects: next })
  }
  async deleteProject(id: string): Promise<void> { this.commit({ ...this.data, projects: this.data.projects.filter((project) => project.id !== id) }) }
  getProjectImages(projectId: string) { return clone(this.getProject(projectId)?.images ?? []) }
  async updateProjectImages(projectId: string, images: [ProjectImage, ProjectImage, ProjectImage]): Promise<void> {
    const project = this.getProject(projectId)
    if (project) await this.saveProject({ ...project, images })
  }

  // ── Experience ─────────────────────────────────────────────────────────────
  getExperience() { return orderByDisplay(this.data.experience) }
  async saveExperience(entry: ExperienceEntry): Promise<void> { this.commit({ ...this.data, experience: this.data.experience.some((item) => item.id === entry.id) ? this.data.experience.map((item) => item.id === entry.id ? entry : item) : [...this.data.experience, entry] }) }
  async deleteExperience(id: string): Promise<void> { this.commit({ ...this.data, experience: this.data.experience.filter((entry) => entry.id !== id) }) }

  // ── Education ──────────────────────────────────────────────────────────────
  getEducation() { return orderByDisplay(this.data.education) }
  async saveEducation(entry: EducationEntry): Promise<void> { this.commit({ ...this.data, education: this.data.education.some((item) => item.id === entry.id) ? this.data.education.map((item) => item.id === entry.id ? entry : item) : [...this.data.education, entry] }) }
  async deleteEducation(id: string): Promise<void> { this.commit({ ...this.data, education: this.data.education.filter((entry) => entry.id !== id) }) }

  // ── Organizations ──────────────────────────────────────────────────────────
  getOrganizations() { return orderByDisplay(this.data.organizations) }
  async saveOrganization(entry: OrganizationEntry): Promise<void> { this.commit({ ...this.data, organizations: this.data.organizations.some((item) => item.id === entry.id) ? this.data.organizations.map((item) => item.id === entry.id ? entry : item) : [...this.data.organizations, entry] }) }
  async deleteOrganization(id: string): Promise<void> { this.commit({ ...this.data, organizations: this.data.organizations.filter((entry) => entry.id !== id) }) }

  // ── Skills ─────────────────────────────────────────────────────────────────
  getSkills() { return orderByDisplay(this.data.skills) }
  async saveSkillGroup(group: SkillGroup): Promise<void> { this.commit({ ...this.data, skills: this.data.skills.some((item) => item.id === group.id) ? this.data.skills.map((item) => item.id === group.id ? group : item) : [...this.data.skills, group] }) }
  async deleteSkillGroup(id: string): Promise<void> { this.commit({ ...this.data, skills: this.data.skills.filter((group) => group.id !== id) }) }

  // ── Profile ────────────────────────────────────────────────────────────────
  getProfile() { return clone(this.data.profile) }
  async saveProfile(profile: Profile): Promise<void> { this.commit({ ...this.data, profile }) }

  // ── Social links ───────────────────────────────────────────────────────────
  getSocialLinks() { return orderByDisplay(this.data.socialLinks) }
  async saveSocialLink(link: SocialLink): Promise<void> { this.commit({ ...this.data, socialLinks: this.data.socialLinks.some((item) => item.id === link.id) ? this.data.socialLinks.map((item) => item.id === link.id ? link : item) : [...this.data.socialLinks, link] }) }
  async deleteSocialLink(id: string): Promise<void> { this.commit({ ...this.data, socialLinks: this.data.socialLinks.filter((link) => link.id !== id) }) }

  // ── Messages ───────────────────────────────────────────────────────────────
  getMessages() { return [...this.data.messages].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)) }
  async addMessage(message: ContactMessage): Promise<void> { this.commit({ ...this.data, messages: [message, ...this.data.messages] }) }
  async markMessageRead(id: string): Promise<void> { this.commit({ ...this.data, messages: this.data.messages.map((message) => message.id === id ? { ...message, read: true } : message) }) }
  async deleteMessage(id: string): Promise<void> { this.commit({ ...this.data, messages: this.data.messages.filter((message) => message.id !== id) }) }
}
