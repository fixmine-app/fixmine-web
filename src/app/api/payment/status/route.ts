import { NextRequest, NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const sb = await createServer()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ plan: 'free', expires: null })
    const { data: profile } = await sb.from('profiles').select('plan, plan_expires_at').eq('id', user.id).single()
    if (!profile) return NextResponse.json({ plan: 'free', expires: null })
    if (profile.plan === 'pro' && profile.plan_expires_at && new Date(profile.plan_expires_at) < new Date()) {
      await sb.from('profiles').update({ plan: 'free', updated_at: new Date().toISOString() }).eq('id', user.id)
      return NextResponse.json({ plan: 'free', expires: null })
    }
    return NextResponse.json({ plan: profile.plan, expires: profile.plan_expires_at })
  } catch { return NextResponse.json({ plan: 'free', expires: null }) }
}
