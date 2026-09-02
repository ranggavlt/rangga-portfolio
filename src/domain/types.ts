export type ProjectImage = {
  id: string
  src: string
  alt: string
  caption: string
  position: 1 | 2 | 3
}

export type PortfolioProject = {
  id: string
  slug: string
  title: string
  year: string
  category: string
  shortDescription: string
  fullDescription: string
  role: string
  tech: string[]
  liveUrl: string
  sourceUrl: string
  published: boolean
  displayOrder: number
  images: [ProjectImage, ProjectImage, ProjectImage]
  updatedAt: string
}

export type ExperienceEntry = {
  id: string
  period: string
  company: string
  role: string
  description: string
  published: boolean
  displayOrder: number
}

export type EducationEntry = {
  id: string
  period: string
  institution: string
  degree: string
  detail: string
  displayOrder: number
}

export type OrganizationEntry = {
  id: string
  name: string
  meta: string
  detail: string
  published: boolean
  displayOrder: number
}

export type SkillGroup = {
  id: string
  label: string
  skills: string[]
  displayOrder: number
}

export type Profile = {
  fullName: string
  professionalTitle: string
  heroEyebrow: string
  heroHeading: string
  heroDescription: string
  aboutHeading: string
  aboutBiography: string
  aboutSecondary: string
  location: string
  availabilityText: string
  email: string
  portraitUrl: string
  cvUrl: string
  footerText: string
}

export type SocialLink = {
  id: string
  platform: string
  url: string
  displayOrder: number
  enabled: boolean
}

export type ContactMessage = {
  id: string
  sender: string
  email: string
  message: string
  submittedAt: string
  read: boolean
}

export type PortfolioData = {
  projects: PortfolioProject[]
  experience: ExperienceEntry[]
  education: EducationEntry[]
  organizations: OrganizationEntry[]
  skills: SkillGroup[]
  profile: Profile
  socialLinks: SocialLink[]
  messages: ContactMessage[]
}

export type RepositoryListener = (data: PortfolioData) => void

export interface PortfolioRepository {
  // Lifecycle
  initialize(): Promise<void>
  refresh(): Promise<void>
  // Synchronous snapshot + subscription (kept sync for React render performance)
  getSnapshot(): PortfolioData
  subscribe(listener: RepositoryListener): () => void
  // Reset
  reset(): Promise<void>
  // Projects
  getProjects(): PortfolioProject[]
  getProject(id: string): PortfolioProject | undefined
  saveProject(project: PortfolioProject): Promise<void>
  deleteProject(id: string): Promise<void>
  getProjectImages(projectId: string): ProjectImage[]
  updateProjectImages(projectId: string, images: [ProjectImage, ProjectImage, ProjectImage]): Promise<void>
  // Experience
  getExperience(): ExperienceEntry[]
  saveExperience(entry: ExperienceEntry): Promise<void>
  deleteExperience(id: string): Promise<void>
  // Education
  getEducation(): EducationEntry[]
  saveEducation(entry: EducationEntry): Promise<void>
  deleteEducation(id: string): Promise<void>
  // Organizations
  getOrganizations(): OrganizationEntry[]
  saveOrganization(entry: OrganizationEntry): Promise<void>
  deleteOrganization(id: string): Promise<void>
  // Skills
  getSkills(): SkillGroup[]
  saveSkillGroup(group: SkillGroup): Promise<void>
  deleteSkillGroup(id: string): Promise<void>
  // Profile
  getProfile(): Profile
  saveProfile(profile: Profile): Promise<void>
  // Social links
  getSocialLinks(): SocialLink[]
  saveSocialLink(link: SocialLink): Promise<void>
  deleteSocialLink(id: string): Promise<void>
  // Messages
  getMessages(): ContactMessage[]
  addMessage(message: ContactMessage): Promise<void>
  markMessageRead(id: string): Promise<void>
  deleteMessage(id: string): Promise<void>
}
