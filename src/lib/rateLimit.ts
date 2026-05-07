import type { NextRequest } from 'next/server'

const FREE_LIMIT = 3
function getIP(req: NextRequest) {
  return req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'
}
function getMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

export async function checkRateLimit(req: NextRequest, userId?: string) {
  const ip = getIP(req)
  const month = getMonth()
  try {
    const { supabaseAdmin } = await import('./supabase-server')
    const matchCol = userId ? 'user_id' : 'ip'
    const matchVal = userId || ip
    const { data } = await supabaseAdmin.from('usage').select('count')
      .eq(matchCol, matchVal).eq('month', month).maybeSingle()
    const count = data?.count ?? 0
    if (count >= FREE_LIMIT) return { allowed: false, remaining: 0, count }
    await supabaseAdmin.from('usage').upsert(
      { [matchCol]: matchVal, month, count: count + 1, updated_at: new Date().toISOString() },
      { onConflict: userId ? 'user_id,month' : 'ip,month' }
    )
    return { allowed: true, remaining: FREE_LIMIT - count - 1, count: count + 1 }
  } catch {
    return { allowed: true, remaining: 2, count: 1 }
  }
}
