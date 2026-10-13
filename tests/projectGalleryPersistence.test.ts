import assert from 'node:assert/strict'
import test from 'node:test'
import type { PortfolioProject } from '../src/domain/types.ts'
import { saveProjectWithGalleryReplacements } from '../src/admin/lib/projectGalleryPersistence.ts'

const project = (): PortfolioProject => ({
  id: 'project-1', slug: 'project-one', title: 'Project One', year: '2026', category: 'Web',
  shortDescription: 'Short', fullDescription: 'Full', role: 'Developer', tech: ['React'],
  liveUrl: '', sourceUrl: '', published: true, displayOrder: 1, updatedAt: '2026-01-01T00:00:00.000Z',
  images: [
    { id: 'image-1', src: 'https://old.test/1.jpg', storagePath: 'projects/project-one/old-1.jpg', alt: 'Alt one', caption: 'Caption one', position: 1 },
    { id: 'image-2', src: 'https://old.test/2.jpg', storagePath: 'projects/project-one/old-2.jpg', alt: 'Alt two', caption: 'Caption two', position: 2 },
    { id: 'image-3', src: 'https://old.test/3.jpg', storagePath: 'projects/project-one/old-3.jpg', alt: 'Alt three', caption: 'Caption three', position: 3 },
  ],
})

test('uploads a replacement into its exact slot and persists all three image records', async () => {
  let persisted = project()
  const removed: string[][] = []
  const repository = {
    mode: 'supabase' as const,
    getProjects: () => [persisted],
    saveProject: async (value: PortfolioProject) => { persisted = structuredClone(value) },
  }
  const media = {
    uploadProjectImage: async (_file: File, _slug: string, position: 1 | 2 | 3) => ({
      publicUrl: `https://storage.test/new-${position}.webp`,
      storagePath: `projects/project-one/new-${position}.webp`,
    }),
    removeProjectImages: async (paths: string[]) => { removed.push(paths) },
  }

  const result = await saveProjectWithGalleryReplacements({
    project: project(),
    finalSlug: 'project-one',
    pendingFiles: { 3: new File(['image'], 'replacement.webp', { type: 'image/webp' }) },
    repository,
    media,
  })

  assert.equal(result.project.images.length, 3)
  assert.equal(result.project.images[0].src, 'https://old.test/1.jpg')
  assert.equal(result.project.images[1].src, 'https://old.test/2.jpg')
  assert.equal(result.project.images[2].src, 'https://storage.test/new-3.webp')
  assert.equal(result.project.images[2].storagePath, 'projects/project-one/new-3.webp')
  assert.equal(result.project.images[2].alt, 'Alt three')
  assert.equal(result.project.images[2].caption, 'Caption three')
  assert.deepEqual(removed, [['projects/project-one/old-3.jpg']])
})

test('reports the slot on upload failure and does not save the project', async () => {
  let saveCalls = 0
  const repository = {
    mode: 'supabase' as const,
    getProjects: () => [project()],
    saveProject: async () => { saveCalls += 1 },
  }
  const media = {
    uploadProjectImage: async () => { throw new Error('bucket policy denied the request') },
    removeProjectImages: async () => undefined,
  }

  await assert.rejects(
    saveProjectWithGalleryReplacements({
      project: project(), finalSlug: 'project-one',
      pendingFiles: { 3: new File(['image'], 'replacement.webp', { type: 'image/webp' }) },
      repository, media,
    }),
    /Gallery image 3 upload failed: bucket policy denied the request/,
  )
  assert.equal(saveCalls, 0)
})

test('does not silently discard a selected file in local repository mode', async () => {
  let saveCalls = 0
  const repository = {
    mode: 'local' as const,
    getProjects: () => [project()],
    saveProject: async () => { saveCalls += 1 },
  }

  await assert.rejects(
    saveProjectWithGalleryReplacements({
      project: project(), finalSlug: 'project-one',
      pendingFiles: { 1: new File(['image'], 'replacement.webp', { type: 'image/webp' }) },
      repository, media: null,
    }),
    /Supabase Storage is not configured/,
  )
  assert.equal(saveCalls, 0)
})

test('keeps uploaded files when post-save verification fails', async () => {
  const removed: string[][] = []
  const repository = {
    mode: 'supabase' as const,
    getProjects: () => [project()],
    saveProject: async () => undefined,
  }
  const media = {
    uploadProjectImage: async () => ({ publicUrl: 'https://storage.test/new-1.webp', storagePath: 'projects/project-one/new-1.webp' }),
    removeProjectImages: async (paths: string[]) => { removed.push(paths) },
  }

  await assert.rejects(
    saveProjectWithGalleryReplacements({
      project: project(), finalSlug: 'project-one',
      pendingFiles: { 1: new File(['image'], 'replacement.webp', { type: 'image/webp' }) },
      repository, media,
    }),
    (reason: unknown) => reason instanceof Error
      && reason.message.includes('could not be verified after reload')
      && 'projectWasSaved' in reason
      && reason.projectWasSaved === true,
  )
  assert.deepEqual(removed, [])
})
