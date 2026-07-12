import { createClient } from '@supabase/supabase-js'
import { isSupabase } from './dataSource'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (isSupabase && (!url || !anonKey)) {
  throw new Error('VITE_DATA_SOURCE=supabase requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to be set.')
}

// only ever constructed when actually needed — mock mode never touches this
export const supabase = isSupabase ? createClient(url!, anonKey!) : null
