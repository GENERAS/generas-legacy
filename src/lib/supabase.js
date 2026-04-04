import { createClient } from '@supabase/supabase-js'

// Get these from your Supabase Dashboard → Project Settings → API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a single supabase client for the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'sb-auth-token'
  },
  realtime: {
    enabled: true,
    timeout: 20000,
    heartbeatIntervalMs: 15000
  }
})

// Helper function to check if current user is admin
export const isAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  return data?.role === 'admin'
}