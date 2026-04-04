'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/types/database'

// ── Helper: get authenticated server client ──────────────────
function getClient() {
  return createServerActionClient<Database>({ cookies })
}

// ── Helper: verify admin role ─────────────────────────────────
async function requireAdmin(supabase: ReturnType<typeof getClient>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') throw new Error('Admin access required')
  return user
}

// ─────────────────────────────────────────────────────────────
// RFQ ACTIONS
// ─────────────────────────────────────────────────────────────

/** Submit a new RFQ — runs matching engine automatically */
export async function submitRFQ(formData: {
  requester_name: string
  requester_email: string
  requester_company?: string
  requester_phone?: string
  equipment_category: string
  required_capacity?: string
  capacity_unit?: string
  span_required?: string
  lift_height?: string
  duty_class?: string
  site_region: string
  site_country?: string
  site_details?: string
  rental_duration?: string
  project_description?: string
  budget_range?: string
  special_requirements?: string
  urgency?: string
}) {
  const supabase = getClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Insert RFQ
  const { data: rfq, error } = await supabase.from('rfqs').insert({
    requester_id: user?.id ?? null,
    requester_name: formData.requester_name,
    requester_email: formData.requester_email,
    requester_company: formData.requester_company ?? null,
    requester_phone: formData.requester_phone ?? null,
    equipment_category: formData.equipment_category,
    required_capacity: formData.required_capacity ?? null,
    capacity_unit: (formData.capacity_unit ?? 'tonnes') as 'tonnes' | 'kg' | 'lbs',
    span_required: formData.span_required ?? null,
    lift_height: formData.lift_height ?? null,
    duty_class: formData.duty_class ?? null,
    site_region: formData.site_region,
    site_country: formData.site_country ?? null,
    site_details: formData.site_details ?? null,
    rental_duration: formData.rental_duration ?? null,
    project_description: formData.project_description ?? null,
    budget_range: formData.budget_range ?? null,
    special_requirements: formData.special_requirements ?? null,
    urgency: (formData.urgency ?? 'medium') as 'low' | 'medium' | 'high' | 'urgent',
    status: 'new',
    source: 'website',
  } as any).select('id, rfq_number').single()

  if (error) throw new Error(error.message)

  // Run matching engine asynchronously
  await runRFQMatching(rfq.id, formData.equipment_category, formData.site_region)

  // Notify admin
  await supabase.from('notifications').insert({
    user_id: null, // admin global notification — handled differently in prod
    type: 'new_rfq',
    title: 'New RFQ Submitted',
    message: `${formData.requester_name} (${formData.requester_company ?? 'N/A'}) submitted an RFQ for ${formData.equipment_category} in ${formData.site_region}`,
    data: { rfq_id: rfq.id, rfq_number: rfq.rfq_number },
  })

  revalidatePath('/admin/leads')
  return { success: true, rfq_number: rfq.rfq_number, id: rfq.id }
}

/** RFQ Matching Engine — scores all verified vendors and stores top matches */
async function runRFQMatching(rfqId: string, category: string, region: string) {
  const supabase = getClient()

  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, equipment_categories, region, tier, verified, rfq_count')
    .eq('is_active', true)

  if (!vendors?.length) return

  // Score each vendor
  const scored = vendors.map(v => {
    let score = 0
    const catLow = category.toLowerCase().replace(/_/g, ' ')
    const vendorCats = v.equipment_categories.map(c => c.toLowerCase())

    // Category match (50 pts)
    if (vendorCats.some(c => c === catLow)) score += 50
    else if (vendorCats.some(c => c.includes(catLow.split(' ')[0]) || catLow.includes(c.split(' ')[0]))) score += 30

    // Region match (30 pts)
    const regionLow = region.toLowerCase()
    const vRegion = v.region.toLowerCase()
    const regionMap: Record<string, string[]> = {
      india: ['india'], gcc: ['uae','dubai','saudi','qatar','kuwait','oman','bahrain','gcc'],
      africa: ['nigeria','ghana','liberia','ivory','west africa','africa'],
    }
    const matchRegions = regionMap[vRegion] ?? [vRegion]
    if (matchRegions.some(r => regionLow.includes(r))) score += 30

    // Tier bonus
    const tierBonus: Record<string, number> = { enterprise: 20, featured: 15, standard: 8, free: 0 }
    score += tierBonus[v.tier] ?? 0

    // Verified bonus
    if (v.verified) score += 10

    // Capacity signal
    if ((v.rfq_count ?? 0) < 10) score += 5

    return { id: v.id, score }
  })
  .filter(v => v.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 5)

  const matchedIds = scored.map(v => v.id)

  await supabase.from('rfqs').update({
    matched_vendor_ids: matchedIds,
    status: matchedIds.length > 0 ? 'matched' : 'new',
  } as any).eq('id', rfqId)
}

/** Admin: dispatch RFQ to selected vendors (BCC logic) */
export async function dispatchRFQ(rfqId: string, vendorIds: string[], message?: string) {
  const supabase = getClient()
  await requireAdmin(supabase)

  // Update RFQ status
  const { error } = await supabase.from('rfqs').update({
    status: 'dispatched',
    dispatched_to: vendorIds,
    dispatched_at: new Date().toISOString(),
    dispatch_message: message ?? null,
    commission_status: 'expected',
  } as any).eq('id', rfqId)

  if (error) throw new Error(error.message)

  // Get RFQ details
  const { data: rfq } = await supabase.from('rfqs')
    .select('rfq_number, requester_name, equipment_category, site_region, project_description, required_capacity')
    .eq('id', rfqId).single()

  // Create rfq_response rows for each vendor
  for (const vendorId of vendorIds) {
    await supabase.from('rfq_responses').upsert({
      rfq_id: rfqId,
      vendor_id: vendorId,
      status: 'received',
    }, { onConflict: 'rfq_id,vendor_id', ignoreDuplicates: true })

    // Increment vendor RFQ count
    await supabase.rpc('increment_vendor_rfq_count', { p_id: vendorId })

    // Get vendor profile_id to notify
    const { data: vendor } = await supabase.from('vendors')
      .select('profile_id, company_name').eq('id', vendorId).single()

    if (vendor?.profile_id) {
      await supabase.from('notifications').insert({
        user_id: vendor.profile_id,
        type: 'rfq_received',
        title: `New RFQ: ${rfq?.equipment_category ?? 'Equipment'}`,
        message: `You have received an RFQ for ${rfq?.equipment_category} in ${rfq?.site_region}. Capacity: ${rfq?.required_capacity ?? 'TBD'}. Please log in to view and respond.`,
        data: { rfq_id: rfqId, rfq_number: rfq?.rfq_number },
      } as any)
    }
  }

  revalidatePath('/admin/leads')
  return { success: true, dispatched: vendorIds.length }
}

/** Admin: update RFQ status and commission */
export async function updateRFQStatus(rfqId: string, updates: {
  status?: string
  admin_notes?: string
  commission_status?: string
  expected_commission?: number
  actual_deal_value?: number
}) {
  const supabase = getClient()
  await requireAdmin(supabase)

  const { error } = await supabase.from('rfqs').update({
    ...updates,
    updated_at: new Date().toISOString(),
  } as any).eq('id', rfqId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/leads')
  return { success: true }
}

// ─────────────────────────────────────────────────────────────
// VENDOR ACTIONS
// ─────────────────────────────────────────────────────────────

/** Vendor submits their own listing */
export async function createVendorListing(data: {
  company_name: string; slug: string; description: string
  country: string; city: string; region: string
  equipment_categories: string[]; certifications: string[]
  email: string; phone?: string; whatsapp?: string; website?: string
  year_established?: number; employee_count?: string
}) {
  const supabase = getClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be signed in to list a company')

  // Check for duplicate slug
  const { data: existing } = await supabase.from('vendors').select('id').eq('slug', data.slug).single()
  if (existing) throw new Error('This URL slug is already taken. Please choose another.')

  const { data: vendor, error } = await supabase.from('vendors').insert({
    profile_id: user.id,
    company_name: data.company_name,
    slug: data.slug,
    description: data.description,
    country: data.country,
    city: data.city,
    region: data.region as 'india' | 'gcc' | 'africa' | 'asia' | 'europe' | 'americas',
    equipment_categories: data.equipment_categories,
    certifications: data.certifications,
    email: data.email,
    phone: data.phone ?? null,
    whatsapp: data.whatsapp ?? null,
    website: data.website ?? null,
    year_established: data.year_established ?? null,
    employee_count: data.employee_count ?? null,
    tier: 'free',
    verified: false,
    featured: false,
    is_active: true,
  } as any).select('id, slug').single()

  if (error) throw new Error(error.message)

  // Update profile role to vendor
  await supabase.from('profiles').update({ role: 'vendor' } as any).eq('id', user.id)

  revalidatePath('/directory')
  return { success: true, slug: vendor.slug }
}

/** Admin: approve/verify a vendor */
export async function approveVendor(vendorId: string, notes?: string) {
  const supabase = getClient()
  await requireAdmin(supabase)

  const { error } = await supabase.from('vendors').update({
    verified: true, admin_notes: notes ?? null,
  } as any).eq('id', vendorId)

  if (error) throw new Error(error.message)

  // Notify vendor
  const { data: vendor } = await supabase.from('vendors')
    .select('profile_id, company_name').eq('id', vendorId).single()

  if (vendor?.profile_id) {
    await supabase.from('notifications').insert({
      user_id: vendor.profile_id,
      type: 'vendor_approved',
      title: 'Your listing is Verified!',
      message: `${vendor.company_name} has been verified on HoistMarket. Your listing now shows a Verified badge and you will receive matched RFQs.`,
      data: { vendor_id: vendorId },
    })
  }

  revalidatePath('/admin/vendors')
  revalidatePath('/directory')
  return { success: true }
}

/** Admin: reject/suspend vendor */
export async function suspendVendor(vendorId: string, reason: string) {
  const supabase = getClient()
  await requireAdmin(supabase)

  const { error } = await supabase.from('vendors').update({
    is_active: false, verified: false, admin_notes: reason,
  } as any).eq('id', vendorId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/vendors')
  return { success: true }
}

/** Admin: update vendor tier (after payment confirmed) */
export async function updateVendorTier(vendorId: string, tier: 'free' | 'standard' | 'featured' | 'enterprise', expiresAt?: string) {
  const supabase = getClient()
  await requireAdmin(supabase)

  const { error } = await supabase.from('vendors').update({
    tier,
    featured: tier === 'featured' || tier === 'enterprise',
    membership_expires_at: expiresAt ?? null,
  } as any).eq('id', vendorId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/vendors')
  revalidatePath('/directory')
  return { success: true }
}

/** Vendor: submit a quote response to an RFQ */
export async function submitVendorQuote(rfqId: string, vendorId: string, quoteData: {
  quote_amount: number
  quote_currency: string
  message: string
}) {
  const supabase = getClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify vendor owns this listing
  const { data: vendor } = await supabase.from('vendors')
    .select('id, profile_id').eq('id', vendorId).eq('profile_id', user.id).single()
  if (!vendor) throw new Error('Vendor not found or not authorized')

  const { error } = await supabase.from('rfq_responses').upsert({
    rfq_id: rfqId,
    vendor_id: vendorId,
    status: 'quoted',
    quote_amount: quoteData.quote_amount,
    quote_currency: quoteData.quote_currency,
    message: quoteData.message,
    responded_at: new Date().toISOString(),
  }, { onConflict: 'rfq_id,vendor_id' })

  if (error) throw new Error(error.message)

  // Notify requester
  const { data: rfq } = await supabase.from('rfqs')
    .select('requester_id, rfq_number').eq('id', rfqId).single()

  if (rfq?.requester_id) {
    const { data: v } = await supabase.from('vendors').select('company_name').eq('id', vendorId).single()
    await supabase.from('notifications').insert({
      user_id: rfq.requester_id,
      type: 'quote_received',
      title: `Quote received for ${rfq.rfq_number}`,
      message: `${v?.company_name} has submitted a quote of ${quoteData.quote_currency} ${quoteData.quote_amount.toLocaleString()} for your RFQ.`,
      data: { rfq_id: rfqId, vendor_id: vendorId },
    })
  }

  return { success: true }
}

// ─────────────────────────────────────────────────────────────
// ARTICLE ACTIONS
// ─────────────────────────────────────────────────────────────

/** Admin: create or update an article */
export async function upsertArticle(data: {
  id?: string; slug: string; title: string; excerpt?: string; content: string
  category: string; tags?: string[]; seo_title?: string; seo_description?: string
  seo_keywords?: string[]; reading_time?: number; is_published?: boolean; is_featured?: boolean
}) {
  const supabase = getClient()
  const admin = await requireAdmin(supabase)

  const payload = {
    slug: data.slug, title: data.title, excerpt: data.excerpt ?? null,
    content: data.content, category: data.category,
    tags: data.tags ?? [], author_id: admin.id,
    seo_title: data.seo_title ?? null, seo_description: data.seo_description ?? null,
    seo_keywords: data.seo_keywords ?? [],
    reading_time: data.reading_time ?? 5,
    is_published: data.is_published ?? false,
    is_featured: data.is_featured ?? false,
    published_at: data.is_published ? new Date().toISOString() : null,
  }

  let result
  if (data.id) {
    const { data: article, error } = await supabase.from('articles').update(payload).eq('id', data.id).select('id,slug').single()
    if (error) throw new Error(error.message)
    result = article
  } else {
    const { data: article, error } = await supabase.from('articles').insert(payload).select('id,slug').single()
    if (error) throw new Error(error.message)
    result = article
  }

  revalidatePath('/knowledge-base')
  revalidatePath(`/knowledge-base/${data.slug}`)
  return { success: true, ...result }
}

// ─────────────────────────────────────────────────────────────
// MEMBERSHIP / PAYMENT ACTIONS
// ─────────────────────────────────────────────────────────────

/** Record a successful membership payment */
export async function activateMembership(data: {
  vendor_id: string
  tier: 'standard' | 'featured' | 'enterprise'
  billing_cycle: 'monthly' | 'annual'
  price_inr: number
  price_usd: number
  razorpay_order_id?: string
  razorpay_payment_id?: string
  razorpay_signature?: string
}) {
  const supabase = getClient()

  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + (data.billing_cycle === 'annual' ? 12 : 1))

  // Create membership record
  const { error: mErr } = await supabase.from('memberships').insert({
    vendor_id: data.vendor_id,
    tier: data.tier,
    price_inr: data.price_inr,
    price_usd: data.price_usd,
    billing_cycle: data.billing_cycle,
    razorpay_order_id: data.razorpay_order_id ?? null,
    razorpay_payment_id: data.razorpay_payment_id ?? null,
    razorpay_signature: data.razorpay_signature ?? null,
    status: 'active',
    starts_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  } as any)
  if (mErr) throw new Error(mErr.message)

  // Update vendor tier
  const { error: vErr } = await supabase.from('vendors').update({
    tier: data.tier,
    featured: data.tier === 'featured' || data.tier === 'enterprise',
    membership_expires_at: expiresAt.toISOString(),
  } as any).eq('id', data.vendor_id)
  if (vErr) throw new Error(vErr.message)

  revalidatePath('/directory')
  return { success: true, expires_at: expiresAt.toISOString() }
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATION ACTIONS
// ─────────────────────────────────────────────────────────────

/** Mark notifications as read */
export async function markNotificationsRead(notificationIds?: string[]) {
  const supabase = getClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const query = supabase.from('notifications').update({ read: true } as any).eq('user_id', user.id)
  if (notificationIds?.length) {
    query.in('id', notificationIds)
  }

  const { error } = await query
  if (error) throw new Error(error.message)
  return { success: true }
}

// ─────────────────────────────────────────────────────────────
// PROFILE ACTIONS
// ─────────────────────────────────────────────────────────────

/** Update user profile */
export async function updateProfile(data: {
  full_name?: string; company?: string; phone?: string
}) {
  const supabase = getClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('profiles').update({
    full_name: data.full_name ?? null,
    company: data.company ?? null,
    phone: data.phone ?? null,
    updated_at: new Date().toISOString(),
  } as any).eq('id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  return { success: true }
}
