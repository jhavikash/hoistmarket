import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createHmac } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { sendMembershipActivated } from '@/lib/email'

// Razorpay sends webhooks for payment events
// Set RAZORPAY_WEBHOOK_SECRET in .env.local (from Razorpay dashboard)
export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature') ?? ''
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    // Verify webhook signature
    if (webhookSecret) {
      const expected = createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')
      if (signature !== expected) {
        console.error('[Webhook] Invalid Razorpay signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    const event = JSON.parse(body)
    console.log('[Webhook] Razorpay event:', event.event)

    // Use service role for webhook processing
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity
        const { vendorId, planId } = payment.notes ?? {}

        if (!vendorId || !planId) {
          console.log('[Webhook] Missing notes in payment:', payment.id)
          break
        }

        const PLANS: Record<string, { tier: 'standard' | 'featured' | 'enterprise'; months: number; price_inr: number; price_usd: number }> = {
          standard_monthly:  { tier: 'standard',  months: 1,  price_inr: 500,   price_usd: 6 },
          standard_annual:   { tier: 'standard',  months: 12, price_inr: 5000,  price_usd: 60 },
          featured_monthly:  { tier: 'featured',  months: 1,  price_inr: 1800,  price_usd: 22 },
          featured_annual:   { tier: 'featured',  months: 12, price_inr: 18000, price_usd: 216 },
          enterprise_annual: { tier: 'enterprise',months: 12, price_inr: 60000, price_usd: 720 },
        }

        const plan = PLANS[planId]
        if (!plan) { console.log('[Webhook] Unknown planId:', planId); break }

        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + plan.months)

        // Create membership
        await supabase.from('memberships').insert({
          vendor_id: vendorId,
          tier: plan.tier,
          price_inr: plan.price_inr,
          price_usd: plan.price_usd,
          billing_cycle: plan.months === 1 ? 'monthly' : 'annual',
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          status: 'active',
          starts_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })

        // Upgrade vendor
        await supabase.from('vendors').update({
          tier: plan.tier,
          featured: plan.tier === 'featured' || plan.tier === 'enterprise',
          membership_expires_at: expiresAt.toISOString(),
        }).eq('id', vendorId)

        // Get vendor info for notification
        const { data: vendor } = await supabase.from('vendors')
          .select('profile_id, company_name, email').eq('id', vendorId).single()

        if (vendor?.profile_id) {
          await supabase.from('notifications').insert({
            user_id: vendor.profile_id,
            type: 'membership_activated',
            title: `${plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)} membership activated`,
            message: `Your ${plan.tier} membership is now active. You'll start receiving matched RFQs immediately.`,
            data: { vendor_id: vendorId, tier: plan.tier, expires_at: expiresAt.toISOString() },
          })

          // Send confirmation email
          const { data: profile } = await supabase.from('profiles')
            .select('full_name, email').eq('id', vendor.profile_id).single()

          if (profile?.email) {
            await sendMembershipActivated(profile.email, {
              vendor_name: profile.full_name ?? vendor.company_name,
              company_name: vendor.company_name,
              tier: plan.tier,
              expires_at: expiresAt.toISOString(),
              price: `₹${plan.price_inr.toLocaleString('en-IN')}`,
            })
          }
        }

        console.log('[Webhook] Membership activated:', vendorId, plan.tier)
        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity
        const { vendorId } = payment.notes ?? {}
        console.log('[Webhook] Payment failed for vendor:', vendorId, payment.error_description)
        break
      }

      case 'subscription.charged': {
        // Handle recurring subscription billing
        console.log('[Webhook] Subscription charged:', event.payload?.subscription?.entity?.id)
        break
      }

      default:
        console.log('[Webhook] Unhandled event:', event.event)
    }

    return NextResponse.json({ received: true })
  } catch (e: any) {
    console.error('[Webhook] Error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
