import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHmac } from 'crypto'
import type { Database } from '@/types/database'

const PLANS = {
  standard_monthly:  { price_inr: 500,   price_usd: 6,   label: 'Standard Monthly',  tier: 'standard' as const, months: 1 },
  standard_annual:   { price_inr: 5000,  price_usd: 60,  label: 'Standard Annual',   tier: 'standard' as const, months: 12 },
  featured_monthly:  { price_inr: 1800,  price_usd: 22,  label: 'Featured Monthly',  tier: 'featured' as const, months: 1 },
  featured_annual:   { price_inr: 18000, price_usd: 216, label: 'Featured Annual',   tier: 'featured' as const, months: 12 },
  enterprise_annual: { price_inr: 60000, price_usd: 720, label: 'Enterprise Annual', tier: 'enterprise' as const, months: 12 },
}

// POST /api/payments — create Razorpay order
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Must be signed in' }, { status: 401 })

    const { planId, vendorId, currency = 'INR' } = await req.json()
    const plan = PLANS[planId as keyof typeof PLANS]
    if (!plan) return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })

    // Verify vendor belongs to user
    const { data: vendor } = await supabase.from('vendors')
      .select('id, company_name').eq('id', vendorId).eq('profile_id', user.id).single()
    if (!vendor) return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    // Dev mode — return mock order
    if (!keyId || !keySecret || keyId.includes('mock')) {
      return NextResponse.json({
        orderId: `order_dev_${Date.now()}`,
        amount: currency === 'INR' ? plan.price_inr * 100 : plan.price_usd * 100,
        currency,
        keyId: keyId ?? 'rzp_test_dev',
        planLabel: plan.label,
        tier: plan.tier,
        dev: true,
      })
    }

    const amount = currency === 'INR' ? plan.price_inr * 100 : plan.price_usd * 100
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency,
        receipt: `hm_${vendorId.slice(0, 8)}_${Date.now()}`,
        notes: { vendorId, planId, userId: user.id, companyName: vendor.company_name },
      }),
    })

    if (!rzpRes.ok) {
      const err = await rzpRes.text()
      return NextResponse.json({ error: `Razorpay error: ${err}` }, { status: 500 })
    }

    const order = await rzpRes.json()
    return NextResponse.json({
      orderId: order.id, amount: order.amount, currency: order.currency,
      keyId, planLabel: plan.label, tier: plan.tier,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PUT /api/payments — verify payment & activate membership
export async function PUT(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orderId, paymentId, signature, vendorId, planId, dev } = await req.json()

    const plan = PLANS[planId as keyof typeof PLANS]
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

    // In production: verify Razorpay signature
    if (!dev) {
      const keySecret = process.env.RAZORPAY_KEY_SECRET!
      const expected = createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex')
      if (signature !== expected) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
      }
    }

    // Compute expiry
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + plan.months)

    // Create membership record
    const { error: mErr } = await supabase.from('memberships').insert({
      vendor_id: vendorId,
      tier: plan.tier,
      price_inr: plan.price_inr,
      price_usd: plan.price_usd,
      billing_cycle: plan.months === 1 ? 'monthly' : 'annual',
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId ?? null,
      razorpay_signature: signature ?? null,
      status: 'active',
      starts_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    } as any)
    if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 })

    // Upgrade vendor tier
    const { error: vErr } = await supabase.from('vendors').update({
      tier: plan.tier,
      featured: plan.tier === 'featured' || plan.tier === 'enterprise',
      membership_expires_at: expiresAt.toISOString(),
    } as any).eq('id', vendorId)
    if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 })

    // Notify vendor
    const { data: vendor } = await supabase.from('vendors')
      .select('profile_id, company_name').eq('id', vendorId).single()
    if (vendor?.profile_id) {
      await supabase.from('notifications').insert({
        user_id: vendor.profile_id,
        type: 'membership_activated',
        title: `${plan.label} membership activated`,
        message: `Your HoistMarket ${plan.tier} membership is now active. You will start receiving matched RFQs. Valid until ${expiresAt.toLocaleDateString()}.`,
        data: { vendor_id: vendorId, tier: plan.tier, expires_at: expiresAt.toISOString() },
      })
    }

    return NextResponse.json({ success: true, tier: plan.tier, expires_at: expiresAt.toISOString() })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
