'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, Zap, LogOut, User, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import RfqForm from './RfqForm'

const navLinks = [
  { label: 'Knowledge Base', href: '/knowledge-base' },
  { label: 'Directory', href: '/directory' },
  { label: 'Equipment', href: '/equipment' },
  { label: 'Rentals', href: '/rentals' },
  { label: 'News', href: '/news' },
  { label: 'About', href: '/about' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<{ role: string; full_name: string | null } | null>(null)
  const [showRFQ, setShowRFQ] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('role, full_name').eq('id', session.user.id).single()
        setProfile(data)
      } else {
        setProfile(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-navy-950 shadow-navy' : 'bg-navy-950/95 backdrop-blur-sm'
      } border-b border-white/5`}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center flex-shrink-0 group-hover:bg-orange-400 transition-colors">
                <span className="text-white font-bold text-sm">HM</span>
              </div>
              <div className="hidden xs:block">
                <span className="text-white font-bold text-lg leading-none tracking-tight">
                  Hoist<span className="text-orange-500">Market</span>
                </span>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <ul className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm font-medium px-3 py-2 rounded transition-colors duration-150 ${
                      pathname?.startsWith(link.href)
                        ? 'text-white bg-white/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded bg-white/8 hover:bg-white/12 transition-colors text-sm text-white font-medium"
                  >
                    <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
                      {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="hidden sm:block max-w-[100px] truncate">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 animate-slide-down">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
                        {profile?.role && (
                          <span className={`text-xs font-semibold uppercase tracking-wider ${profile.role === 'admin' ? 'text-orange-500' : 'text-blue-500'}`}>
                            {profile.role}
                          </span>
                        )}
                      </div>
                      {profile?.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        My Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors border border-white/10"
                >
                  <User className="w-3.5 h-3.5" />
                  Sign In
                </Link>
              )}

              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}

              <button
                onClick={() => setShowRFQ(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded transition-all duration-150 hover:-translate-y-px hover:shadow-glow-orange"
              >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:block">Request Quote</span>
                <span className="sm:hidden">RFQ</span>
              </button>

              {/* HAMBURGER */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {isOpen && (
            <div className="lg:hidden border-t border-white/5 pb-4 animate-slide-down">
              <ul className="space-y-1 pt-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                        pathname?.startsWith(link.href)
                          ? 'text-white bg-white/10'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-2 border-t border-white/5">
                  {user ? (
                    <button onClick={handleSignOut} className="block w-full text-left px-3 py-2.5 text-sm text-slate-400 hover:text-white">
                      Sign Out
                    </button>
                  ) : (
                    <Link href="/login" className="block px-3 py-2.5 text-sm text-slate-400 hover:text-white">Sign In</Link>
                  )}
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Overlay to close user menu */}
      {showUserMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
      )}

      {/* RFQ MODAL */}
      {showRFQ && <RfqForm onClose={() => setShowRFQ(false)} />}
    </>
  )
}
