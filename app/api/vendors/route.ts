import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// GET /api/vendors — filtered vendor list
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const url = new URL(req.url)
    const region   = url.searchParams.get('region')
    const category = url.searchParams.get('category')
    const tier     = url.searchParams.get('tier')
    const verified = url.searchParams.get('verified')
    const search   = url.searchParams.get('search')
    const limit    = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 100)
    const offset   = parseInt(url.searchParams.get('offset') ?? '0', 10)

    let query = supabase
      .from('vendors')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('featured', { ascending: false })
      .order('tier', { ascending: false })
      .order('verified', { ascending: false })
      .order('company_name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (region && region !== 'all') query = query.eq('region', region)
    if (tier && tier !== 'all') query = query.eq('tier', tier)
    if (verified === 'true') query = query.eq('verified', true)
    if (category && category !== 'all') {
      query = query.contains('equipment_categories', [category])
    }
    if (search) {
      query = query.or(
        `company_name.ilike.%${search}%,city.ilike.%${search}%,country.ilike.%${search}%`
      )
    }

    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ vendors: data ?? [], total: count ?? 0 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/vendors — create vendor listing (authenticated)
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Must be signed in' }, { status: 401 })

    const body = await req.json()
    const required = ['company_name', 'slug', 'description', 'country', 'city', 'region', 'email', 'equipment_categories']
    for (const f of required) {
      if (!body[f] || (Array.isArray(body[f]) && body[f].length === 0)) {
        return NextResponse.json({ error: `${f} is required` }, { status: 400 })
      }
    }

    // Slug uniqueness check
    const { data: existing } = await supabase.from('vendors').select('id').eq('slug', body.slug).maybeSingle()
    if (existing) return NextResponse.json({ error: 'Slug already taken. Choose a different URL.' }, { status: 409 })

    const { data: vendor, error } = await supabase.from('vendors').insert({
      profile_id: user.id,
      company_name: body.company_name,
      slug: body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      description: body.description,
      country: body.country, city: body.city,
      region: body.region,
      equipment_categories: body.equipment_categories,
      certifications: body.certifications ?? [],
      specializations: body.specializations ?? [],
      email: body.email, phone: body.phone ?? null, whatsapp: body.whatsapp ?? null,
      website: body.website ?? null, year_established: body.year_established ?? null,
      employee_count: body.employee_count ?? null,
      tier: 'free', verified: false, featured: false, is_active: true,
    }).select('id, slug').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Update user role to vendor
    await supabase.from('profiles').update({ role: 'vendor' }).eq('id', user.id)

    return NextResponse.json({ success: true, slug: vendor.slug, id: vendor.id }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH /api/vendors — admin update vendor
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const body = await req.json()
    const { vendorId, ...updates } = body

    if (!vendorId) return NextResponse.json({ error: 'vendorId required' }, { status: 400 })

    // Admin can update anything; vendor can only update their own listing
    if (profile?.role !== 'admin') {
      const { data: vendor } = await supabase.from('vendors').select('profile_id').eq('id', vendorId).single()
      if (vendor?.profile_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      // Strip admin-only fields
      delete updates.verified; delete updates.featured; delete updates.tier; delete updates.admin_notes
    }

    const { error } = await supabase.from('vendors').update(updates).eq('id', vendorId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
