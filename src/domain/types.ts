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
  getSnapshot(): PortfolioData
  subscribe(listener: RepositoryListener): () => void
  reset(): void
  getProjects(): PortfolioProject[]
  getProject(id: string): PortfolioProject | undefined
  saveProject(project: PortfolioProject): void
  deleteProject(id: string): void
  getProjectImages(projectId: string): ProjectImage[]
  updateProjectImages(projectId: string, images: [ProjectImage, ProjectImage, ProjectImage]): void
  getExperience(): ExperienceEntry[]
  saveExperience(entry: ExperienceEntry): void
  deleteExperience(id: string): void
  getEducation(): EducationEntry[]
  saveEducation(entry: EducationEntry): void
  deleteEducation(id: string): void
  getOrganizations(): OrganizationEntry[]
  saveOrganization(entry: OrganizationEntry): void
  deleteOrganization(id: string): void
  getSkills(): SkillGroup[]
  saveSkillGroup(group: SkillGroup): void
  deleteSkillGroup(id: string): void
  getProfile(): Profile
  saveProfile(profile: Profile): void
  getSocialLinks(): SocialLink[]
  saveSocialLink(link: SocialLink): void
  deleteSocialLink(id: string): void
  getMessages(): ContactMessage[]
  addMessage(message: ContactMessage): void
  markMessageRead(id: string): void
  deleteMessage(id: string): void
}
