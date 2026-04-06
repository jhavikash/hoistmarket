import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = req.nextUrl

  // ── Admin protection ───────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = new URL('/login', req.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/?error=unauthorized', req.url))
    }
  }

  // ── Dashboard & vendor portal protection ─────────────────
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/vendor/portal')) {
    if (!user) {
      const url = new URL('/login', req.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // ── Redirect logged-in users away from /login ─────────────
  if (pathname === '/login' && user) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    return NextResponse.redirect(
      new URL(profile?.role === 'admin' ? '/admin' : '/dashboard', req.url)
    )
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/vendor/portal/:path*', '/login'],
}
