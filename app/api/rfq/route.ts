import { createSupabaseServer } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import { sendRFQConfirmation, sendAdminRFQAlert, sendVendorRFQDispatch } from '@/lib/email'

type V = { id: string; equipment_categories: string[]; region: string; tier: string; verified: boolean; rfq_count: number }

function scoreVendor(v: V, cat: string, region: string): number {
  let s = 0
  const c = cat.toLowerCase().replace(/_/g,' ')
  const vc = v.equipment_categories.map(x => x.toLowerCase())
  if (vc.includes(c)) s += 50
  else if (vc.some(x => x.includes(c.split(' ')[0]) || c.includes(x.split(' ')[0]))) s += 30
  const rm: Record<string,string[]> = {
    india: ['india'],
    gcc: ['uae','dubai','saudi','qatar','kuwait','oman','bahrain','gcc'],
    africa: ['nigeria','ghana','liberia','ivory','africa','west africa'],
    asia: ['singapore','malaysia','thailand','indonesia','vietnam'],
    europe: ['uk','germany','france','netherlands','europe'],
  }
  const vr = rm[v.region] ?? [v.region]
  if (vr.some(r => region.toLowerCase().includes(r))) s += 30
  const tb: Record<string,number> = { enterprise:20, featured:15, standard:8, free:0 }
  s += tb[v.tier] ?? 0
  if (v.verified) s += 10
  if (v.rfq_count < 5) s += 5
  return Math.min(s, 100)
}

// POST — submit new RFQ
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const body = await req.json()
    if (!body.requester_name || !body.requester_email || !body.equipment_category || !body.site_region) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const { data: { user } } = await supabase.auth.getUser()

    // Insert RFQ
    const { data: rfq, error: re } = await supabase.from('rfqs').insert({
      requester_id: user?.id ?? null,
      requester_name: body.requester_name, requester_email: body.requester_email,
      requester_company: body.requester_company ?? null, requester_phone: body.requester_phone ?? null,
      equipment_category: body.equipment_category, equipment_subcategory: body.equipment_subcategory ?? null,
      required_capacity: body.required_capacity ?? null, capacity_unit: body.capacity_unit ?? 'tonnes',
      span_required: body.span_required ?? null, lift_height: body.lift_height ?? null,
      duty_class: body.duty_class ?? null, site_region: body.site_region,
      site_country: body.site_country ?? null, site_details: body.site_details ?? null,
      rental_duration: body.rental_duration ?? null, project_description: body.project_description ?? null,
      budget_range: body.budget_range ?? null, special_requirements: body.special_requirements ?? null,
      urgency: body.urgency ?? 'medium', status: 'new', source: 'website',
    }).select('id, rfq_number').single()

    if (re) return NextResponse.json({ error: re.message }, { status: 500 })

    // Run matching engine
    const { data: vendors } = await supabase
      .from('vendors')
      .select('id,equipment_categories,region,tier,verified,rfq_count')
      .eq('is_active', true)

    let matchedIds: string[] = []
    if (vendors?.length) {
      const scored = vendors
        .map(v => ({ id: v.id, s: scoreVendor(v as V, body.equipment_category, body.site_region) }))
        .filter(v => v.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 5)
      matchedIds = scored.map(v => v.id)
      if (matchedIds.length > 0) {
        await supabase.from('rfqs').update({ matched_vendor_ids: matchedIds, status: 'matched' }).eq('id', rfq.id)
      }
    }

    // Send confirmation email to requester (fire and forget)
    sendRFQConfirmation(body.requester_email, {
      rfq_number: rfq.rfq_number,
      name: body.requester_name,
      equipment_category: body.equipment_category,
      site_region: body.site_region,
      matched_vendors: matchedIds.length,
    }).catch(e => console.error('[RFQ email error]', e))

    // Alert admin
    sendAdminRFQAlert({
      rfq_number: rfq.rfq_number,
      requester_name: body.requester_name,
      requester_email: body.requester_email,
      requester_company: body.requester_company ?? null,
      equipment_category: body.equipment_category,
      site_region: body.site_region,
      required_capacity: body.required_capacity ?? null,
      urgency: body.urgency ?? 'medium',
      matched_vendors: matchedIds.length,
    }).catch(e => console.error('[Admin alert error]', e))

    return NextResponse.json({ success: true, rfq_number: rfq.rfq_number, id: rfq.id, matched_vendors: matchedIds.length })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

// GET — list RFQs
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const url = new URL(req.url)
    const status = url.searchParams.get('status')
    const limit = parseInt(url.searchParams.get('limit', 10) ?? '50', 10)
    let query = supabase.from('rfqs').select('*', { count: 'exact' })
    if (profile?.role !== 'admin') query = query.eq('requester_id', user.id)
    else if (status) query = query.eq('status', status)
    query = query.order('created_at', { ascending: false }).limit(limit)
    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ rfqs: data, total: count })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}

// PUT — admin dispatch + status updates
export async function PUT(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await req.json()
    const { rfqId, vendorIds, message, statusUpdate } = body

    // Plain status/commission update
    if (statusUpdate) {
      const { error } = await supabase.from('rfqs').update(statusUpdate).eq('id', rfqId)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    // Dispatch to vendors
    await supabase.from('rfqs').update({
      status: 'dispatched', dispatched_to: vendorIds,
      dispatched_at: new Date().toISOString(),
      dispatch_message: message ?? null, commission_status: 'expected',
    }).eq('id', rfqId)

    const { data: rfq } = await supabase.from('rfqs')
      .select('rfq_number, requester_name, equipment_category, site_region, required_capacity, urgency, project_description')
      .eq('id', rfqId).single()

    const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://hoistmarket.com'}/vendor/portal`

    for (const vid of vendorIds) {
      await supabase.from('rfq_responses').upsert(
        { rfq_id: rfqId, vendor_id: vid, status: 'received' },
        { onConflict: 'rfq_id,vendor_id', ignoreDuplicates: true }
      )
      await supabase.rpc('increment_vendor_rfq_count', { p_id: vid })

      const { data: vendor } = await supabase.from('vendors')
        .select('profile_id, company_name, email').eq('id', vid).single()

      if (vendor?.profile_id) {
        await supabase.from('notifications').insert({
          user_id: vendor.profile_id, type: 'rfq_received',
          title: `New RFQ: ${rfq?.equipment_category}`,
          message: `You have a new RFQ for ${rfq?.equipment_category} in ${rfq?.site_region}. Log in to view and respond.`,
          data: { rfq_id: rfqId, rfq_number: rfq?.rfq_number },
        })
      }

      // Send dispatch email to vendor
      if (vendor?.email) {
        sendVendorRFQDispatch(vendor.email, {
          vendor_name: vendor.company_name,
          rfq_number: rfq?.rfq_number ?? '',
          equipment_category: rfq?.equipment_category ?? '',
          site_region: rfq?.site_region ?? '',
          required_capacity: rfq?.required_capacity ?? null,
          urgency: rfq?.urgency ?? 'medium',
          dispatch_message: message ?? null,
          portal_url: portalUrl,
        }).catch(e => console.error('[Dispatch email error]', e))
      }
    }

    return NextResponse.json({ success: true, dispatched: vendorIds.length })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
