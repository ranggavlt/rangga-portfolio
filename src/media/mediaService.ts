import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../lib/database.types'
import { supabase } from '../lib/supabase'

export const PORTFOLIO_IMAGES_BUCKET = 'portfolio-images'
export const PORTFOLIO_DOCUMENTS_BUCKET = 'portfolio-documents'

const PROJECT_IMAGE_MAX_BYTES = 5 * 1024 * 1024
const PORTRAIT_MAX_BYTES = 3 * 1024 * 1024
const CV_MAX_BYTES = 10 * 1024 * 1024
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export type UploadedMedia = { publicUrl: string; storagePath: string }

const validateImage = (file: File, maxBytes: number, label: string) => {
  if (!IMAGE_EXTENSIONS[file.type]) throw new Error(`${label} must be a JPEG, PNG, or WebP image.`)
  if (file.size > maxBytes) throw new Error(`${label} must be ${maxBytes / (1024 * 1024)} MB or smaller.`)
}

export const validateProjectImage = async (file: File) => {
  validateImage(file, PROJECT_IMAGE_MAX_BYTES, 'Project image')
  let bitmap: ImageBitmap
  try { bitmap = await createImageBitmap(file) }
  catch { throw new Error('Project image could not be decoded.') }
  try {
    if (bitmap.width <= bitmap.height) throw new Error('Project image must use a landscape orientation.')
  } finally {
    bitmap.close()
  }
}
export const validatePortraitImage = (file: File) => validateImage(file, PORTRAIT_MAX_BYTES, 'Portrait')
export const validateCvPdf = (file: File) => {
  if (file.type !== 'application/pdf') throw new Error('CV must be a PDF document.')
  if (file.size > CV_MAX_BYTES) throw new Error('CV must be 10 MB or smaller.')
}

const safeReference = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'project'

const storageFailure = (action: 'upload' | 'remove', bucket: string, message: string) => {
  const normalized = message.toLowerCase()
  const label = bucket === PORTFOLIO_DOCUMENTS_BUCKET ? 'CV document' : 'image'
  if (normalized.includes('bucket not found') || normalized.includes('not found')) {
    return new Error(`Could not ${action} ${label}: the Supabase Storage bucket "${bucket}" is missing. Apply the Phase 4 storage migration in the Supabase Dashboard.`)
  }
  if (normalized.includes('row-level security') || normalized.includes('unauthorized') || normalized.includes('permission') || normalized.includes('403')) {
    return new Error(`Could not ${action} ${label}: Supabase Storage denied the request. Verify the signed-in user is listed in admin_users and the Phase 4 storage policies are applied.`)
  }
  if (normalized.includes('mime') || normalized.includes('content type')) {
    return new Error(`Could not ${action} ${label}: Supabase Storage rejected the file type.`)
  }
  if (normalized.includes('size') || normalized.includes('too large')) {
    return new Error(`Could not ${action} ${label}: Supabase Storage rejected the file size.`)
  }
  const sanitized = message.replace(/https?:\/\/\S+/g, '[redacted-url]').replace(/eyJ[A-Za-z0-9._-]+/g, '[redacted-token]').slice(0, 240)
  return new Error(`Could not ${action} ${label}: ${sanitized || 'Supabase Storage rejected the request.'}`)
}

export class SupabaseMediaService {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async uploadProjectImage(file: File, projectReference: string, position: 1 | 2 | 3) {
    await validateProjectImage(file)
    const path = `projects/${safeReference(projectReference)}/${position}-${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`
    return this.upload(PORTFOLIO_IMAGES_BUCKET, path, file)
  }

  async uploadPortrait(file: File) {
    validatePortraitImage(file)
    const path = `profile/portrait-${crypto.randomUUID()}.${IMAGE_EXTENSIONS[file.type]}`
    return this.upload(PORTFOLIO_IMAGES_BUCKET, path, file)
  }

  async uploadCv(file: File) {
    validateCvPdf(file)
    return this.upload(PORTFOLIO_DOCUMENTS_BUCKET, `profile/cv-${crypto.randomUUID()}.pdf`, file)
  }

  async removeProjectImages(paths: string[]) { await this.remove(PORTFOLIO_IMAGES_BUCKET, paths) }
  async removePortrait(path: string) { await this.remove(PORTFOLIO_IMAGES_BUCKET, [path]) }
  async removeCv(path: string) { await this.remove(PORTFOLIO_DOCUMENTS_BUCKET, [path]) }

  private async upload(bucket: string, path: string, file: File): Promise<UploadedMedia> {
    const { error } = await this.client.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: '31536000',
    })
    if (error) throw storageFailure('upload', bucket, error.message)
    const { data } = this.client.storage.from(bucket).getPublicUrl(path)
    return { publicUrl: data.publicUrl, storagePath: path }
  }

  private async remove(bucket: string, paths: string[]) {
    const managedPaths = [...new Set(paths.filter(Boolean))]
    if (!managedPaths.length) return
    const { error } = await this.client.storage.from(bucket).remove(managedPaths)
    if (error) throw storageFailure('remove', bucket, error.message)
  }
}

export const mediaService = supabase ? new SupabaseMediaService(supabase) : null
