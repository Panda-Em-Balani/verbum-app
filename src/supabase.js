import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kfoymqjekxxilqkyfavi.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmb3ltcWpla3h4aWxxa3lmYXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4NTkxNjEsImV4cCI6MjA5OTQzNTE2MX0.c1e0GCUEqfodxG4N3CSj6tDT3Fe5Fly1IEeub2at0sc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
