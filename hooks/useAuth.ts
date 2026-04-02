import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  full_name: string | null
  company: string | null
  role: 'admin' | 'vendor' | 'user'
}

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  isVendor: boolean
}

/**
 * useAuth — subscribes to Supabase auth state and loads the user profile.
 * Use this in any component that needs to know who is signed in.
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, email, full_name, company, role')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }

    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, email, full_name, company, role')
          .eq('id', session.user.id)
          .single()
        setProfile(data)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    isVendor: profile?.role === 'vendor',
  }
}

/**
 * useRequireAuth — redirects to login if user is not authenticated.
 * Use at the top of protected pages.
 */
export function useRequireAuth(redirectTo = '/login') {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push(`${redirectTo}?redirect=${window.location.pathname}`)
    }
  }, [auth.loading, auth.user, router, redirectTo])

  return auth
}

/**
 * useRequireAdmin — redirects if user is not an admin.
 */
export function useRequireAdmin() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.user) {
        router.push('/login?redirect=/admin')
      } else if (!auth.isAdmin) {
        router.push('/?error=unauthorized')
      }
    }
  }, [auth.loading, auth.user, auth.isAdmin, router])

  return auth
}
