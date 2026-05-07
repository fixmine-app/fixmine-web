// fixmine.app/src/app/api/payment/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServer, supabaseAdmin } from '@/lib/supabase-server'

const CLIENT_ID  = process.env.DOKU_CLIENT_ID!
const SECRET_KEY = process.env.DOKU_SECRET_KEY!
const BASE_URL   = 'https://api.doku.com'

const PLANS: Record<string, { name: string; amount: number; days: number }> = {
  one_time: { name: 'FixMine One-Time Fix', amount: 50000,  days: 0  },
  pro:      { name: 'FixMine Pro Monthly',  amount: 160000, days: 30 },
}

function buildSignature(clientId: string, requestId: string, ts: string, target: string, secret: string, body: string) {
  const digest = 'SHA-256=' + crypto.createHash('sha256').update(body).digest('base64')
  const component = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${ts}`,
    `Request-Target:${target}`,
    `Digest:${digest}`,
  ].join('\n')
  return 'HMACSHA256=' + crypto.createHmac('sha256', secret).update(component).digest('base64')
}

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json()
    const plan = PLANS[planId]
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    const sb = await createServer()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    // FMI prefix — gominers routes by this prefix to FixMine handler
    const invoiceNo = `FMI-${Date.now()}-${user.id.slice(0,6).toUpperCase()}`
    const requestId = crypto.randomUUID()
    const ts        = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
    const target    = '/checkout/v1/payment'

    const bodyObj = {
      client: { id: CLIENT_ID },
      order: {
        invoice_number: invoiceNo,
        line_items: [{ name: plan.name, price: plan.amount, quantity: 1 }],
        amount: plan.amount,
        currency: 'IDR',
        callback_url: 'https://www.gominers.id/api/payment-webhook',
        callback_url_cancel: 'https://fixmine.app/pricing?status=cancelled',
      },
      payment: {
        payment_due_date: 1440,
        payment_method_types: [
          'VIRTUAL_ACCOUNT_BCA','VIRTUAL_ACCOUNT_BANK_MANDIRI',
          'VIRTUAL_ACCOUNT_BNI','VIRTUAL_ACCOUNT_BRI',
          'VIRTUAL_ACCOUNT_BANK_CIMB','VIRTUAL_ACCOUNT_BTN',
          'EMONEY_OVO','EMONEY_DANA','EMONEY_SHOPEE_PAY','EMONEY_LINKAJA',
          'CREDIT_CARD','QRIS',
          'ONLINE_TO_OFFLINE_ALFA','ONLINE_TO_OFFLINE_INDOMARET',
        ],
      },
      customer: {
        id: user.id,
        email: user.email!,
        name: user.email!.split('@')[0],
      },
    }

    const bodyStr   = JSON.stringify(bodyObj)
    const signature = buildSignature(CLIENT_ID, requestId, ts, target, SECRET_KEY, bodyStr)

    const res = await fetch(`${BASE_URL}${target}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Id': CLIENT_ID,
        'Request-Id': requestId,
        'Request-Timestamp': ts,
        'Signature': signature,
      },
      body: bodyStr,
    })

    const data = await res.json()
    if (!res.ok) {
      console.error('DOKU error:', JSON.stringify(data))
      return NextResponse.json({ error: 'Payment creation failed' }, { status: 500 })
    }

    // Save invoice — gominers will update status via Supabase directly
    await supabaseAdmin.from('invoices').upsert({
      user_id: user.id,
      invoice_number: invoiceNo,
      plan_id: planId,
      amount: plan.amount,
      plan_days: plan.days,
      status: 'pending',
      payment_url: data.response?.payment?.url,
      doku_session_id: data.response?.session?.id,
      raw_response: data,
    })

    return NextResponse.json({
      payment_url: data.response?.payment?.url,
      invoice_number: invoiceNo,
      amount: plan.amount,
    })

  } catch (e) {
    console.error('Payment create error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
