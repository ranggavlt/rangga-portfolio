import type { PortfolioProject } from './domain/types'

// Add an exact slug and URL pair only after the portfolio owner confirms
// that this specific source repository may be shown to public visitors.
const approvedPublicSourceUrls = new Map<string, string>()

export function publicSourceUrl(project: PortfolioProject): string | null {
  const approvedUrl = approvedPublicSourceUrls.get(project.slug)
  return approvedUrl && project.sourceUrl === approvedUrl ? approvedUrl : null
}
