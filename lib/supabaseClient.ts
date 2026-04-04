import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ─── Browser client (client components) ────────────────────────────────────
export const supabase = createClientComponentClient<Database>()

// ─── Direct client (server components, SSR) ─────────────────────────────────
export const supabaseServer = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
})

// ─── Service role client (admin API routes only — never expose to browser) ──
export const supabaseAdmin = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')
  return createClient<Database>(supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ─── Untyped client for mutations (avoids 'never' TS errors with strict mode) ─
export const supabaseMutation = createClientComponentClient()
