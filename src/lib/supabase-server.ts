import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function createServer() {
  const cookieStore = await cookies()
  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try { toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) }
        catch {}
      },
    },
  })
}

export const supabaseAdmin = createClient(URL, SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false }
})
