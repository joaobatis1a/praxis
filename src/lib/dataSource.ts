/**
 * Which backend the app talks to. Set per-deployment via VITE_DATA_SOURCE
 * (e.g. two separate Vercel projects on the same repo/branch, each with its
 * own env vars) — "mock" needs no other env vars, "supabase" also needs
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 */
export const isSupabase = import.meta.env.VITE_DATA_SOURCE === 'supabase'
