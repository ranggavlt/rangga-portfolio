import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

export type SupabaseConfig = {
  url: string
  publishableKey: string
}

const readConfig = (): SupabaseConfig | null => {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

  if (!url && !publishableKey) return null
  if (!url || !publishableKey) {
    console.warn('Supabase mode is disabled because both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are required.')
    return null
  }

  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost') throw new Error('Supabase URL must use HTTPS.')
  } catch {
    console.warn('Supabase mode is disabled because VITE_SUPABASE_URL is invalid.')
    return null
  }

  return { url, publishableKey }
}

export const supabaseConfig = readConfig()
export const isSupabaseConfigured = supabaseConfig !== null

export const supabase: SupabaseClient<Database> | null = supabaseConfig
  ? createClient<Database>(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null
