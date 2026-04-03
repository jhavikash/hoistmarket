import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database'

// GET /api/articles — search and filter articles
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const url = new URL(req.url)
    const q        = url.searchParams.get('q') ?? ''
    const category = url.searchParams.get('category') ?? ''
    const featured = url.searchParams.get('featured') === 'true'
    const limit    = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10), 50)
    const offset   = parseInt(url.searchParams.get('offset') ?? '0', 10)

    let query = supabase
      .from('articles')
      .select('id, slug, title, excerpt, category, tags, author_name, reading_time, views_count, is_featured, published_at', { count: 'exact' })
      .eq('is_published', true)

    if (category && category !== 'all') query = query.eq('category', category)
    if (featured) query = query.eq('is_featured', true)

    // Full-text search across title, excerpt, tags
    if (q) {
      query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,category.ilike.%${q}%`)
    }

    query = query.order('is_featured', { ascending: false })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ articles: data ?? [], total: count ?? 0 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST /api/articles — create article (admin only)
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await req.json()
    const { id, ...fields } = body

    if (id) {
      // Update existing
      const { data, error } = await supabase.from('articles').update({
        ...fields,
        published_at: fields.is_published && !fields.published_at ? new Date().toISOString() : fields.published_at,
      }).eq('id', id).select('id, slug').single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, ...data })
    } else {
      // Create new
      const { data, error } = await supabase.from('articles').insert({
        ...fields,
        author_id: user.id,
        published_at: fields.is_published ? new Date().toISOString() : null,
      }).select('id, slug').single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, ...data }, { status: 201 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/articles?id=xxx — delete article (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const { error } = await supabase.from('articles').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
