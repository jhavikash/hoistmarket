'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FileText, Zap, CheckCircle, Clock, AlertCircle, Package,
  User, Building2, Phone, Mail, Edit2, LogOut, ArrowRight,
  Bell, MessageSquare, Eye
} from 'lucide-react'
import { supabase as _sb } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = _sb as any

type Profile = {
  id: string; email: string; full_name: string | null
  company: string | null; phone: string | null; role: string; created_at: string
}

type RFQ = {
  id: string; rfq_number: string; equipment_category: string
  site_region: string; status: string; urgency: string
  required_capacity: string | null; dispatched_to: string[]
  matched_vendor_ids: string[]; created_at: string
}

type Notification = {
  id: string; title: string; message: string; read: boolean; created_at: string; data: any
}

const STATUS_CFG: Record<string, { label: string; color: string; Icon: any }> = {
  new:         { label: 'Submitted',          color: 'bg-slate-50 text-slate-600 border-slate-200',   Icon: Clock },
  reviewing:   { label: 'Under Review',        color: 'bg-yellow-50 text-yellow-700 border-yellow-200', Icon: Eye },
  matched:     { label: 'Vendors Matched',     color: 'bg-blue-50 text-blue-700 border-blue-200',     Icon: CheckCircle },
  dispatched:  { label: 'Sent to Vendors',     color: 'bg-green-50 text-green-700 border-green-200',  Icon: CheckCircle },
  in_progress: { label: 'In Progress',         color: 'bg-purple-50 text-purple-700 border-purple-200', Icon: Zap },
  closed:      { label: 'Closed',              color: 'bg-slate-50 text-slate-500 border-slate-200',   Icon: CheckCircle },
  cancelled:   { label: 'Cancelled',           color: 'bg-red-50 text-red-600 border-red-200',        Icon: AlertCircle },
}

export default function DashboardPage() {
  const [profile, setProfile]       = useState<Profile | null>(null)
  const [rfqs, setRfqs]             = useState<RFQ[]>([])
  const [notifications, setNotifs]  = useState<Notification[]>([])
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [editForm, setEditForm]     = useState({ full_name: '', company: '', phone: '' })
  const [tab, setTab]               = useState<'rfqs' | 'notifications'>('rfqs')
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: p }, { data: r }, { data: n }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('rfqs')
          .select('id,rfq_number,equipment_category,site_region,status,urgency,required_capacity,dispatched_to,matched_vendor_ids,created_at')
          .eq('requester_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('notifications')
          .select('id,title,message,read,created_at,data')
          .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ])

      setProfile(p)
      setRfqs(r ?? [])
      setNotifs(n ?? [])
      if (p) setEditForm({ full_name: p.full_name ?? '', company: p.company ?? '', phone: p.phone ?? '' })
      setLoading(false)
    }
    load()
  }, [router])

  const saveProfile = async () => {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({
      full_name: editForm.full_name || null,
      company: editForm.company || null,
      phone: editForm.phone || null,
      updated_at: new Date().toISOString(),
    } as any).eq('id', profile.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    setProfile(p => p ? { ...p, ...editForm } : null)
    setEditing(false)
    toast.success('Profile updated')
  }

  const markRead = async () => {
    const unread = notifications.filter(n => !n.read).map(n => n.id)
    if (!unread.length) return
    await supabase.from('notifications').update({ read: true } as any).in('id', unread)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  const signOut = async () => { await supabase.auth.signOut(); router.push('/') }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const activeRFQs = rfqs.filter(r => !['closed', 'cancelled'].includes(r.status))
  const closedRFQs = rfqs.filter(r => ['closed', 'cancelled'].includes(r.status))
  const unread = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-navy-950 border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">HM</span>
            </div>
            <span className="text-white font-bold text-sm">Hoist<span className="text-orange-500">Market</span></span>
          </Link>
          <div className="flex items-center gap-3">
            {profile?.role === 'vendor' && (
              <Link href="/vendor/portal" className="text-orange-400 hover:text-orange-300 text-xs font-bold transition-colors">
                Vendor Portal →
              </Link>
            )}
            <span className="text-slate-400 text-xs hidden sm:block">{profile?.email}</span>
            <button onClick={signOut} className="flex items-center gap-1 text-slate-500 hover:text-white text-xs transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-navy-900">
            Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your RFQs and track equipment quotes</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total RFQs',          value: rfqs.length,                                                         icon: FileText,    color: 'text-blue-500 bg-blue-50' },
            { label: 'Active',              value: activeRFQs.length,                                                   icon: Zap,         color: 'text-orange-500 bg-orange-50' },
            { label: 'Vendors Matched',     value: rfqs.filter(r => (r.matched_vendor_ids?.length ?? 0) > 0).length,   icon: CheckCircle, color: 'text-green-500 bg-green-50' },
            { label: 'Unread Notifications',value: unread,                                                               icon: Bell,        color: 'text-purple-500 bg-purple-50' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className={`w-9 h-9 rounded-lg ${k.color} flex items-center justify-center mb-3`}>
                <k.icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold text-navy-900 leading-none mb-1">{k.value}</div>
              <div className="text-xs text-slate-500">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 gap-1">
              {[
                { id: 'rfqs',          label: 'My RFQs',       count: activeRFQs.length },
                { id: 'notifications', label: 'Notifications',  count: unread },
              ].map(t => (
                <button key={t.id} onClick={() => { setTab(t.id as typeof tab); if (t.id === 'notifications') markRead() }}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                    tab === t.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}>
                  {t.label}
                  {t.count > 0 && (
                    <span className="w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {t.count > 9 ? '9+' : t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* RFQs */}
            {tab === 'rfqs' && (
              <div className="space-y-4">
                {/* Active */}
                {activeRFQs.length === 0 && closedRFQs.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="font-semibold text-navy-900 mb-1">No RFQs yet</p>
                    <p className="text-slate-500 text-sm mb-5">Submit your first equipment request and receive quotes from verified vendors.</p>
                    <button onClick={() => window.dispatchEvent(new CustomEvent('open-rfq'))}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors">
                      <Zap className="w-4 h-4" /> Submit RFQ
                    </button>
                  </div>
                ) : (
                  <>
                    {activeRFQs.length > 0 && (
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                          <h2 className="font-bold text-navy-900 text-sm">Active RFQs ({activeRFQs.length})</h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {activeRFQs.map(rfq => {
                            const cfg = STATUS_CFG[rfq.status] ?? STATUS_CFG.new
                            return (
                              <div key={rfq.id} className="px-5 py-4">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div>
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                      <span className="font-mono text-xs font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">{rfq.rfq_number}</span>
                                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cfg.color}`}>
                                        <cfg.Icon className="w-3 h-3" /> {cfg.label}
                                      </span>
                                      <span className={`text-xs font-bold ${rfq.urgency === 'urgent' ? 'text-red-600' : rfq.urgency === 'high' ? 'text-orange-600' : 'text-slate-400'}`}>
                                        {rfq.urgency.charAt(0).toUpperCase() + rfq.urgency.slice(1)}
                                      </span>
                                    </div>
                                    <div className="font-semibold text-navy-900 text-sm">{rfq.equipment_category}</div>
                                    <div className="text-xs text-slate-500">{rfq.site_region}{rfq.required_capacity ? ` · ${rfq.required_capacity}` : ''}</div>
                                  </div>
                                  <div className="text-xs text-slate-400 flex-shrink-0">
                                    {new Date(rfq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                  </div>
                                </div>
                                {rfq.dispatched_to?.length > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 w-fit">
                                    <CheckCircle className="w-3 h-3" />
                                    Sent to {rfq.dispatched_to.length} verified vendor{rfq.dispatched_to.length > 1 ? 's' : ''}
                                  </div>
                                )}
                                {rfq.matched_vendor_ids?.length > 0 && rfq.status === 'matched' && (
                                  <div className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 w-fit">
                                    <MessageSquare className="w-3 h-3" />
                                    {rfq.matched_vendor_ids.length} vendors matched — awaiting admin dispatch
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {closedRFQs.length > 0 && (
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden opacity-70">
                        <div className="px-5 py-4 border-b border-slate-100">
                          <h2 className="font-bold text-navy-900 text-sm">Closed RFQs ({closedRFQs.length})</h2>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {closedRFQs.slice(0, 5).map(rfq => {
                            const cfg = STATUS_CFG[rfq.status] ?? STATUS_CFG.closed
                            return (
                              <div key={rfq.id} className="px-5 py-3 flex items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-slate-500">{rfq.rfq_number}</span>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                                  </div>
                                  <div className="text-xs text-slate-500 mt-0.5">{rfq.equipment_category} · {rfq.site_region}</div>
                                </div>
                                <span className="text-xs text-slate-400">
                                  {new Date(rfq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Notifications */}
            {tab === 'notifications' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map(n => (
                      <div key={n.id} className={`px-5 py-4 ${!n.read ? 'bg-orange-50/40' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-orange-500' : 'bg-slate-200'}`} />
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-navy-900">{n.title}</p>
                              <span className="text-xs text-slate-400 flex-shrink-0">
                                {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-navy-900 text-sm">My Profile</h2>
                <button onClick={() => setEditing(!editing)}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-orange-600 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" /> {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <div className="p-5">
                {editing ? (
                  <div className="space-y-3">
                    {[
                      { key: 'full_name', label: 'Full Name', ph: 'Your name' },
                      { key: 'company',   label: 'Company',   ph: 'Your company' },
                      { key: 'phone',     label: 'Phone',     ph: '+91 / +971...' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">{f.label}</label>
                        <input
                          value={editForm[f.key as keyof typeof editForm]}
                          onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.ph}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    ))}
                    <button onClick={saveProfile} disabled={saving}
                      className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-orange-600">
                        {(profile?.full_name || profile?.email || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    {[
                      { icon: User,      val: profile?.full_name || 'Not set', empty: !profile?.full_name },
                      { icon: Mail,      val: profile?.email,                  empty: false },
                      { icon: Building2, val: profile?.company || 'Not set',   empty: !profile?.company },
                      { icon: Phone,     val: profile?.phone || 'Not set',     empty: !profile?.phone },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm">
                        <item.icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className={item.empty ? 'text-slate-400 italic text-sm' : 'text-slate-700 text-sm truncate'}>{item.val}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-100 text-xs text-slate-400">
                      Member since {new Date(profile?.created_at ?? '').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-bold text-navy-900 text-sm mb-4">Quick Links</h3>
              <div className="space-y-1">
                {[
                  { label: 'Browse Equipment Specs', href: '/equipment', icon: Package },
                  { label: 'Knowledge Base',          href: '/knowledge-base', icon: FileText },
                  { label: 'Find Vendors',            href: '/directory', icon: Building2 },
                  ...(profile?.role === 'vendor' ? [{ label: 'Vendor Portal', href: '/vendor/portal', icon: Zap }] : []),
                ].map(a => (
                  <Link key={a.href} href={a.href}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm text-slate-600 hover:text-navy-900 transition-colors group">
                    <a.icon className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    {a.label}
                    <ArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
