import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    // Use the DB function for aggregated stats
    const { data: stats, error } = await supabase.rpc('get_admin_stats')
    if (error) {
      // Fallback to individual queries if RPC not available
      const [
        { count: totalRFQs },
        { count: newRFQs },
        { count: dispatchedRFQs },
        { count: totalVendors },
        { count: verifiedVendors },
        { count: pendingVendors },
        { count: totalArticles },
        { count: publishedArticles },
        { data: memberships },
      ] = await Promise.all([
        supabase.from('rfqs').select('*', { count: 'exact', head: true }),
        supabase.from('rfqs').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('rfqs').select('*', { count: 'exact', head: true }).in('status', ['dispatched', 'in_progress']),
        supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('verified', true).eq('is_active', true),
        supabase.from('vendors').select('*', { count: 'exact', head: true }).eq('verified', false).eq('is_active', true),
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('memberships').select('price_inr').eq('status', 'active'),
      ])

      const mrr = memberships?.reduce((s, m) => s + (m.price_inr || 0), 0) ?? 0

      return NextResponse.json({
        rfqs: { total: totalRFQs ?? 0, new: newRFQs ?? 0, dispatched: dispatchedRFQs ?? 0 },
        vendors: { total: totalVendors ?? 0, verified: verifiedVendors ?? 0, pending: pendingVendors ?? 0 },
        articles: { total: totalArticles ?? 0, published: publishedArticles ?? 0 },
        revenue: { mrr_inr: mrr, active_memberships: memberships?.length ?? 0 },
      })
    }

    const s = stats?.[0]
    return NextResponse.json({
      rfqs: { total: s?.total_rfqs ?? 0, new: s?.new_rfqs ?? 0, dispatched: s?.dispatched_rfqs ?? 0 },
      vendors: { total: s?.total_vendors ?? 0, verified: s?.verified_vendors ?? 0, pending: s?.pending_vendors ?? 0 },
      articles: { total: s?.total_articles ?? 0, published: s?.published_articles ?? 0 },
      revenue: { mrr_inr: s?.mrr_inr ?? 0, active_memberships: s?.active_memberships ?? 0 },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
