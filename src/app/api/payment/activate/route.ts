// Called by gominers AFTER DOKU confirms payment
// gominers reads fixmine_user_id + fixmine_plan_id from DOKU metadata
// then POSTs here to activate the plan
//
// Request from gominers:
// POST https://fixmine.app/api/payment/activate
// Headers: { Authorization: Bearer FIXMINE_WEBHOOK_SECRET }
// Body: { user_id, plan_id, plan_days, invoice_number, amount }

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const WEBHOOK_SECRET = process.env.FIXMINE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    // Verify it's gominers calling — shared secret
    const auth = req.headers.get('Authorization') || ''
    const token = auth.replace('Bearer ', '').trim()
    if (token !== WEBHOOK_SECRET) {
      console.error('Activate: invalid secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user_id, plan_id, plan_days, invoice_number, amount } = await req.json()

    if (!user_id || !plan_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    console.log(`Activating plan: user=${user_id} plan=${plan_id} days=${plan_days} invoice=${invoice_number}`)

    if (plan_days > 0) {
      // Pro Monthly — set plan + expiry
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + plan_days)

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          plan: 'pro',
          plan_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user_id)

      if (error) {
        console.error('Profile update error:', error)
        return NextResponse.json({ error: 'Failed to activate pro' }, { status: 500 })
      }

      console.log(`✅ Pro activated: user=${user_id} expires=${expiresAt.toISOString()}`)

    } else {
      // One-Time Fix — decrement usage count by 1 (restore 1 diagnosis)
      const month = new Date().toISOString().slice(0, 7)

      const { data: usage } = await supabaseAdmin
        .from('usage')
        .select('count')
        .eq('user_id', user_id)
        .eq('month', month)
        .single()

      if (usage && usage.count > 0) {
        await supabaseAdmin.from('usage').update({
          count: usage.count - 1,
          updated_at: new Date().toISOString(),
        }).eq('user_id', user_id).eq('month', month)
      }

      console.log(`✅ One-time fix granted: user=${user_id}`)
    }

    // Update invoice to paid
    if (invoice_number) {
      await supabaseAdmin.from('invoices').update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('invoice_number', invoice_number)
    }

    return NextResponse.json({ status: 'activated', user_id, plan_id })

  } catch (e) {
    console.error('Activate error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
