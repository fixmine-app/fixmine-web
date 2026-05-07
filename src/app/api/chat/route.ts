import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, TRIAGE_PROMPT, MODELS, selectModel } from '@/lib/ai'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const memStore = new Map<string, { count: number; resetAt: number }>()
const FREE_LIMIT = 3

function getIP(req: NextRequest) {
  return req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'
}

async function checkLimit(req: NextRequest, isPro: boolean) {
  if (isPro) return { allowed: true, remaining: 999 }
  const ip = getIP(req)
  try {
    const { checkRateLimit } = await import('@/lib/rateLimit')
    return await checkRateLimit(req)
  } catch {
    const now = Date.now()
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
    const rec = memStore.get(ip)
    if (!rec || rec.resetAt < monthStart) { memStore.set(ip, { count:1, resetAt:now }); return { allowed:true, remaining:FREE_LIMIT-1 } }
    if (rec.count >= FREE_LIMIT) return { allowed:false, remaining:0 }
    rec.count++
    return { allowed:true, remaining:FREE_LIMIT-rec.count }
  }
}

async function triageMessage(msg: string) {
  try {
    const res = await client.messages.create({ model:MODELS.triage, max_tokens:150, system:TRIAGE_PROMPT, messages:[{role:'user',content:msg}] })
    const text = res.content[0].type==='text' ? res.content[0].text : '{}'
    return JSON.parse(text.trim())
  } catch { return { category:'other', complexity:'medium', is_pc_related:true } }
}

export async function POST(req: NextRequest) {
  try {
    const { messages, isPro=false } = await req.json()
    if (!messages?.length) return NextResponse.json({ error:'No messages' }, { status:400 })
    if (messages.length === 1) {
      const { allowed } = await checkLimit(req, isPro)
      if (!allowed) return NextResponse.json({
        error:'free_limit_reached',
        message:"You've used your 3 free diagnoses this month. Upgrade to Pro for unlimited access.",
        message_id:'Kamu sudah menggunakan 3 diagnosa gratis bulan ini.',
      }, { status:429 })
    }
    const triage = messages.length===1 ? await triageMessage(messages[0].content) : { category:'other', complexity:'medium' }
    const modelTier = selectModel(messages.length, isPro, triage.complexity)
    const model = MODELS[modelTier]
    const stream = await client.messages.create({ model, max_tokens:1200, system:SYSTEM_PROMPT, messages, stream:true })
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type==='content_block_delta' && event.delta.type==='text_delta')
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({text:event.delta.text})}\n\n`))
            if (event.type==='message_stop')
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({done:true,model:modelTier,triage})}\n\n`))
          }
        } catch(e) { controller.error(e) }
        finally { controller.close() }
      }
    })
    return new Response(readable, { headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'} })
  } catch(e) {
    console.error('Chat API error:', e)
    return NextResponse.json({ error:'Failed' }, { status:500 })
  }
}
