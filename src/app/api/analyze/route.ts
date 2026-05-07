import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from '@/lib/ai'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const ALLOWED_IMAGE_TYPES = ['image/jpeg','image/png','image/gif','image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4','video/mov','video/mpeg','video/quicktime']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const text = formData.get('text') as string || ''
    const file = formData.get('file') as File | null
    const historyRaw = formData.get('history') as string || '[]'
    const history = JSON.parse(historyRaw)
    const contentBlocks: Anthropic.MessageParam['content'] = []
    if (file) {
      const fileBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(fileBuffer).toString('base64')
      const mimeType = file.type
      if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
        if (fileBuffer.byteLength > 5*1024*1024) return NextResponse.json({ error:'Image too large. Max 5MB.' }, { status:400 })
        contentBlocks.push({ type:'image', source:{ type:'base64', media_type:mimeType as any, data:base64 } })
        contentBlocks.push({ type:'text', text: text ? `User attached screenshot. They say: "${text}"\n\nAnalyze image carefully for errors, dialogs, system stats. Diagnose and fix.` : 'User attached screenshot of PC issue. Analyze and provide step-by-step fix.' })
      } else if (ALLOWED_VIDEO_TYPES.includes(mimeType)) {
        contentBlocks.push({ type:'text', text:`User uploaded video of PC problem${text?` and says: "${text}"`:''}. Diagnose most likely issue and provide fix.` })
      } else {
        return NextResponse.json({ error:'Unsupported file type. Use JPG, PNG, GIF, WebP, or MP4.' }, { status:400 })
      }
    } else { contentBlocks.push({ type:'text', text }) }
    const messages: Anthropic.MessageParam[] = [
      ...history.map((m: any) => ({ role: m.role as 'user'|'assistant', content: m.content })),
      { role:'user', content:contentBlocks },
    ]
    const stream = await client.messages.create({ model:'claude-sonnet-4-20250514', max_tokens:1200, system:SYSTEM_PROMPT, messages, stream:true })
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type==='content_block_delta' && event.delta.type==='text_delta')
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({text:event.delta.text})}\n\n`))
            if (event.type==='message_stop')
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({done:true,model:'vision'})}\n\n`))
          }
        } catch(err) { controller.error(err) }
        finally { controller.close() }
      }
    })
    return new Response(readable, { headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache'} })
  } catch(err) {
    console.error('Analyze API error:', err)
    return NextResponse.json({ error:'Failed to analyze' }, { status:500 })
  }
}
