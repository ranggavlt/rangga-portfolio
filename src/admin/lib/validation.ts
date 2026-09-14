export const isHttpUrl = (value: string, allowEmpty = true) => {
  const trimmed = value.trim()
  if (!trimmed) return allowEmpty
  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const errorMessage = (reason: unknown, fallback: string) => reason instanceof Error ? reason.message : fallback

export const moveId = (ids: string[], index: number, direction: -1 | 1) => {
  const target = index + direction
  if (target < 0 || target >= ids.length) return ids
  const next = [...ids]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const storageFileName = (path: string | null | undefined, fallback: string) => {
  if (!path) return fallback
  const name = path.split('/').pop()
  return name || fallback
}
