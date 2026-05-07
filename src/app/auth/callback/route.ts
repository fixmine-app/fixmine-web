import { createServer } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  if (code) {
    const sb = await createServer()
    await sb.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(new URL(next, req.url))
}
