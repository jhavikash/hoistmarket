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

interface Profile {
  role: string
  full_name: string | null
  email: string
}

const navItems = [
  { href: '/admin',           label: 'Overview',          icon: LayoutDashboard, exact: true },
  { href: '/admin/leads',     label: 'RFQ Leads',         icon: Inbox,           badge: 'new' },
  { href: '/admin/vendors',   label: 'Vendor Onboarding', icon: Users },
  { href: '/admin/content',   label: 'Content Calendar',  icon: FileText },
  { href: '/admin/revenue',   label: 'Revenue Tracker',   icon: DollarSign },
  { href: '/admin/ads',       label: 'Ad Placements',     icon: Megaphone },
  { href: '/admin/analytics', label: 'SEO & Analytics',   icon: BarChart3 },
  { href: '/admin/settings',  label: 'Settings',          icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading]         = useState(true)
  const [userName, setUserName]       = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [newRFQCount, setNewRFQCount] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?redirect=/admin'); return }

      const { data } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', user.id)
        .single()

      const profile = data as Profile | null

      if (!profile || profile.role !== 'admin') {
        router.push('/?error=unauthorized')
        return
      }

      setUserName(profile.full_name || profile.email || 'Admin')
      setLoading(false)

      const { count } = await supabase
        .from('rfqs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')
      setNewRFQCount(count ?? 0)
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
      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-60 bg-navy-950 flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-4 py-5 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">HM</span>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-none">HoistMarket</div>
              <div className="text-orange-500 text-[10px] font-semibold tracking-widest uppercase mt-0.5">Admin</div>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{userName}</p>
              <p className="text-slate-500 text-[10px]">Solo Admin · Full Access</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-600 px-2 pb-2">Operations</p>
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-orange-500/15 text-white border-l-2 border-orange-500 pl-2.5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-orange-400' : ''}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge === 'new' && newRFQCount > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {newRFQCount}
                  </span>
                )}
                {active && <ChevronRight className="w-3 h-3 text-orange-400" />}
              </Link>
            )
          })}
          <div className="pt-4">
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-600 px-2 pb-2">Quick Actions</p>
            <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <TrendingUp className="w-4 h-4" />
              View Live Site
            </Link>
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-slate-700 rounded">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-navy-900">
                {navItems.find(n => isActive(n.href, n.exact))?.label || 'Admin Dashboard'}
              </h1>
              <p className="text-xs text-slate-400">HoistMarket Solo Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
              {newRFQCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </button>
            <Link href="/" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              View Site →
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
