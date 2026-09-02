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
  SkillGroup,
  SocialLink,
} from '../domain/types'
import { createSeedPortfolioData } from './seed'

export const DEMO_STORAGE_KEY = 'rangga-portfolio-demo-v1'

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
const orderByDisplay = <T extends { displayOrder: number }>(items: T[]) => [...items].sort((a, b) => a.displayOrder - b.displayOrder)
const stamp = () => new Date().toISOString()

export class LocalPortfolioRepository implements PortfolioRepository {
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
      projects: Array.isArray(data.projects) ? data.projects : seed.projects,
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

  getSnapshot() { return clone(this.data) }
  subscribe(listener: RepositoryListener) { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  reset() { this.commit(createSeedPortfolioData()) }

  getProjects() { return orderByDisplay(this.data.projects) }
  getProject(id: string) { return this.data.projects.find((project) => project.id === id) }
  saveProject(project: PortfolioProject) {
    const next = this.data.projects.some((item) => item.id === project.id)
      ? this.data.projects.map((item) => item.id === project.id ? { ...project, updatedAt: stamp() } : item)
      : [...this.data.projects, { ...project, updatedAt: stamp() }]
    this.commit({ ...this.data, projects: next })
  }
  deleteProject(id: string) { this.commit({ ...this.data, projects: this.data.projects.filter((project) => project.id !== id) }) }
  getProjectImages(projectId: string) { return clone(this.getProject(projectId)?.images ?? []) }
  updateProjectImages(projectId: string, images: [ProjectImage, ProjectImage, ProjectImage]) {
    const project = this.getProject(projectId)
    if (project) this.saveProject({ ...project, images })
  }

  getExperience() { return orderByDisplay(this.data.experience) }
  saveExperience(entry: ExperienceEntry) { this.commit({ ...this.data, experience: this.data.experience.some((item) => item.id === entry.id) ? this.data.experience.map((item) => item.id === entry.id ? entry : item) : [...this.data.experience, entry] }) }
  deleteExperience(id: string) { this.commit({ ...this.data, experience: this.data.experience.filter((entry) => entry.id !== id) }) }

  getEducation() { return orderByDisplay(this.data.education) }
  saveEducation(entry: EducationEntry) { this.commit({ ...this.data, education: this.data.education.some((item) => item.id === entry.id) ? this.data.education.map((item) => item.id === entry.id ? entry : item) : [...this.data.education, entry] }) }
  deleteEducation(id: string) { this.commit({ ...this.data, education: this.data.education.filter((entry) => entry.id !== id) }) }

  getOrganizations() { return orderByDisplay(this.data.organizations) }
  saveOrganization(entry: OrganizationEntry) { this.commit({ ...this.data, organizations: this.data.organizations.some((item) => item.id === entry.id) ? this.data.organizations.map((item) => item.id === entry.id ? entry : item) : [...this.data.organizations, entry] }) }
  deleteOrganization(id: string) { this.commit({ ...this.data, organizations: this.data.organizations.filter((entry) => entry.id !== id) }) }

  getSkills() { return orderByDisplay(this.data.skills) }
  saveSkillGroup(group: SkillGroup) { this.commit({ ...this.data, skills: this.data.skills.some((item) => item.id === group.id) ? this.data.skills.map((item) => item.id === group.id ? group : item) : [...this.data.skills, group] }) }
  deleteSkillGroup(id: string) { this.commit({ ...this.data, skills: this.data.skills.filter((group) => group.id !== id) }) }

  getProfile() { return clone(this.data.profile) }
  saveProfile(profile: Profile) { this.commit({ ...this.data, profile }) }

  getSocialLinks() { return orderByDisplay(this.data.socialLinks) }
  saveSocialLink(link: SocialLink) { this.commit({ ...this.data, socialLinks: this.data.socialLinks.some((item) => item.id === link.id) ? this.data.socialLinks.map((item) => item.id === link.id ? link : item) : [...this.data.socialLinks, link] }) }
  deleteSocialLink(id: string) { this.commit({ ...this.data, socialLinks: this.data.socialLinks.filter((link) => link.id !== id) }) }

  getMessages() { return [...this.data.messages].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)) }
  addMessage(message: ContactMessage) { this.commit({ ...this.data, messages: [message, ...this.data.messages] }) }
  markMessageRead(id: string) { this.commit({ ...this.data, messages: this.data.messages.map((message) => message.id === id ? { ...message, read: true } : message) }) }
  deleteMessage(id: string) { this.commit({ ...this.data, messages: this.data.messages.filter((message) => message.id !== id) }) }
}
