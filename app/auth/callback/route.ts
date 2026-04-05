import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await createSupabaseServer()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      if (!profile) {
        await (supabase as any).from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name ?? null,
          company: data.user.user_metadata?.company ?? null,
          role: data.user.user_metadata?.role ?? 'user',
        })
      }

      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', requestUrl.origin))
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
