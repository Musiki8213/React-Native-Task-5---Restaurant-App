import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://babgrzvonnqjgerwfmrf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhYmdyenZvbm5xamdlcndmbXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4OTkxNTMsImV4cCI6MjA4NDQ3NTE1M30.gN2UcPZbWBk_hdNDYYBDx6uOAij1-iLAFP9Phj3oTU4'

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)
