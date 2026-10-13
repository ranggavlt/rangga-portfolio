import type { PortfolioProject, PortfolioRepository, ProjectImage } from '../../domain/types'
import type { UploadedMedia } from '../../media/mediaService'

export type ImagePosition = 1 | 2 | 3
export type PendingProjectImages = Partial<Record<ImagePosition, File>>

type ProjectImageMedia = {
  uploadProjectImage(file: File, projectReference: string, position: ImagePosition): Promise<UploadedMedia>
  removeProjectImages(paths: string[]): Promise<void>
}

type ProjectGalleryRepository = Pick<PortfolioRepository, 'mode' | 'getProjects' | 'saveProject'>

export type SaveProjectGalleryResult = {
  project: PortfolioProject
  cleanupWarning: string | null
}

export class ProjectGalleryPersistenceError extends Error {
  readonly projectWasSaved: boolean

  constructor(message: string, projectWasSaved = false) {
    super(message)
    this.name = 'ProjectGalleryPersistenceError'
    this.projectWasSaved = projectWasSaved
  }
}

const positions: ImagePosition[] = [1, 2, 3]
const messageOf = (reason: unknown, fallback: string) => reason instanceof Error && reason.message ? reason.message : fallback

const orderedImages = (images: ProjectImage[]): [ProjectImage, ProjectImage, ProjectImage] => {
  if (images.length !== 3 || new Set(images.map((image) => image.position)).size !== 3 || images.some((image) => !positions.includes(image.position))) {
    throw new Error('Each project must keep exactly three gallery images in slots 1, 2, and 3.')
  }
  return positions.map((position) => ({ ...images.find((image) => image.position === position)! })) as [ProjectImage, ProjectImage, ProjectImage]
}

const sameGallery = (actual: PortfolioProject, expected: PortfolioProject) => positions.every((position) => {
  const actualImage = actual.images.find((image) => image.position === position)
  const expectedImage = expected.images.find((image) => image.position === position)
  return Boolean(actualImage && expectedImage
    && actualImage.src === expectedImage.src
    && (actualImage.storagePath ?? null) === (expectedImage.storagePath ?? null)
    && actualImage.alt === expectedImage.alt
    && actualImage.caption === expectedImage.caption)
})

const cleanupUploads = async (media: ProjectImageMedia, paths: string[]) => {
  if (!paths.length) return null
  try {
    await media.removeProjectImages(paths)
    return null
  } catch (reason) {
    return messageOf(reason, 'Newly uploaded files may require manual cleanup.')
  }
}

export async function saveProjectWithGalleryReplacements({
  project,
  finalSlug,
  pendingFiles,
  originalImages = project.images,
  repository,
  media,
  onProgress,
}: {
  project: PortfolioProject
  finalSlug: string
  pendingFiles: PendingProjectImages
  originalImages?: ProjectImage[]
  repository: ProjectGalleryRepository
  media: ProjectImageMedia | null
  onProgress?: (message: string) => void
}): Promise<SaveProjectGalleryResult> {
  let images = orderedImages(project.images)
  const selectedPositions = positions.filter((position) => Boolean(pendingFiles[position]))

  if (selectedPositions.length && (repository.mode !== 'supabase' || !media)) {
    throw new Error('Gallery image upload is unavailable because Supabase Storage is not configured. Configure the Supabase environment variables, then select the file again.')
  }

  const uploadedPaths: string[] = []
  for (const position of selectedPositions) {
    const file = pendingFiles[position]!
    try {
      onProgress?.(`Uploading gallery image ${position} to Supabase Storage…`)
      const uploaded = await media!.uploadProjectImage(file, finalSlug, position)
      uploadedPaths.push(uploaded.storagePath)
      images = images.map((image) => image.position === position
        ? { ...image, src: uploaded.publicUrl, storagePath: uploaded.storagePath }
        : image) as [ProjectImage, ProjectImage, ProjectImage]
    } catch (reason) {
      const cleanupError = await cleanupUploads(media!, uploadedPaths)
      const detail = messageOf(reason, 'Supabase Storage rejected the upload.')
      throw new Error(`Gallery image ${position} upload failed: ${detail}${cleanupError ? ` ${cleanupError}` : ''}`)
    }
  }

  const savedProject: PortfolioProject = {
    ...project,
    slug: finalSlug,
    images,
    updatedAt: new Date().toISOString(),
  }

  try {
    onProgress?.('Saving project and gallery URLs…')
    await repository.saveProject(savedProject)
  } catch (reason) {
    const cleanupError = media ? await cleanupUploads(media, uploadedPaths) : null
    const detail = messageOf(reason, 'The database rejected the project changes.')
    throw new Error(`Project save failed: ${detail}${cleanupError ? ` ${cleanupError}` : ''}`)
  }

  onProgress?.('Verifying the saved gallery…')
  const persistedProject = repository.getProjects().find((item) => item.id === project.id || item.slug === finalSlug)
  if (!persistedProject || !sameGallery(persistedProject, savedProject)) {
    throw new ProjectGalleryPersistenceError('Project save completed, but the three gallery images could not be verified after reload. The uploaded files were kept to avoid breaking a database reference; refresh and try again if the change is not visible.', true)
  }

  const replacedPaths = originalImages
    .filter((oldImage) => oldImage.storagePath && images.find((image) => image.position === oldImage.position)?.storagePath !== oldImage.storagePath)
    .map((image) => image.storagePath as string)
  const cleanupWarning = media ? await cleanupUploads(media, replacedPaths) : null

  return { project: persistedProject, cleanupWarning }
}
