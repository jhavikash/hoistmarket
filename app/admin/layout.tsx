'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard, Inbox, Users, FileText, DollarSign,
  BarChart3, Settings, ChevronRight, LogOut, Bell, Megaphone,
  Menu, X, Zap, TrendingUp
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/leads', label: 'RFQ Leads', icon: Inbox, badge: 'new' },
  { href: '/admin/vendors', label: 'Vendor Onboarding', icon: Users },
  { href: '/admin/content', label: 'Content Calendar', icon: FileText },
  { href: '/admin/revenue', label: 'Revenue Tracker', icon: DollarSign },
  { href: '/admin/ads', label: 'Ad Placements', icon: Megaphone },
  { href: '/admin/analytics', label: 'SEO & Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newRFQCount, setNewRFQCount] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirect=/admin')
        return
      }

      const { data: profile } = await (supabase
        .from('profiles') as any)
        .select('role, full_name, email')
        .eq('id', user.id)
        .single()

      // ✅ FIXED HERE
      if (!profile || (profile as any).role !== 'admin') {
        router.push('/?error=unauthorized')
        return
      }

      setUserName(profile.full_name || profile.email || 'Admin')
      setLoading(false)

      const { count } = await (supabase
        .from('rfqs') as any)
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')

      setNewRFQCount(count || 0)
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center animate-pulse">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <p className="text-slate-500 text-sm">Verifying access...</p>
        </div>
      </div>
    )
  }

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname?.startsWith(href)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-60 bg-navy-950 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-4 py-5 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HM</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm">HoistMarket</div>
              <div className="text-orange-500 text-[10px] font-semibold uppercase">Admin</div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact)
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  active ? 'bg-orange-500/20 text-white' : 'text-slate-400'
                }`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <button onClick={handleSignOut} className="p-3 text-red-400">
          Sign Out
        </button>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  )
}
