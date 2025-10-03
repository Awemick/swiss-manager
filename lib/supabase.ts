import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Client-side Supabase client - only create if env vars are available
let supabaseClient: any = null
export const supabase = (() => {
  if (typeof window === 'undefined') {
    // Server-side or build time, don't create client
    return null
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not found, client not initialized')
    return null
  }
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }
  return supabaseClient
})()