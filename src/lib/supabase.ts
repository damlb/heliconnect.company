import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'heliconnect-company-auth',
    storage: window.localStorage,
  },
})

// Types for user roles
export type UserRole = 'client' | 'company' | 'superadmin'

// Helper to check if user has company access
export function hasCompanyAccess(role: UserRole): boolean {
  return role === 'company' || role === 'superadmin'
}
