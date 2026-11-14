import { createClient } from '@supabase/supabase-js'

// The Supabase project. Both values are public (the anon key only allows what the database
// rules allow). VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY choose a different project, for
// example a separate one for preview deployments; without them this is production.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://kfoymqjekxxilqkyfavi.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmb3ltcWpla3h4aWxxa3lmYXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTkxNjEsImV4cCI6MjA5OTQzNTE2MX0.c1e0GCUEqfodxG4N3CSj6tDT3Fe5Fly1IEeub2at0sc'

// True when the app was opened from a password-reset email. Read before the client starts,
// because the client removes the token from the address once it has used it.
export const openedFromRecoveryLink = typeof window !== 'undefined' && /[#&]type=recovery(&|$)/.test(window.location.hash)

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
})
