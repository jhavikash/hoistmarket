'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Inbox, Eye, TrendingUp, CheckCircle, Clock, AlertCircle,
  Star, CreditCard, Bell, LogOut, Settings, ChevronRight,
  DollarSign, MessageSquare, Building2, ArrowRight, Zap
} from 'lucide-react'
import { supabase as _sb } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = _sb as any

interface VendorPortalData {
  vendor: {
    id: string; company_name: string; slug: string; tier: string
    verified: boolean; featured: boolean; views_count: number; rfq_count: number
    membership_expires_at: string | null; email: string; is_active: boolean
  } | null
  rfqs: Array<{
    id: string; rfq_id: string; status: string; quote_amount: number | null
    quote_currency: string; message: string | null; responded_at: string
    rfqs: { rfq_number: string; equipment_category: string; site_region: string; urgency: string; required_capacity: string | null; project_description: string | null; created_at: string }
  }>
  notifications: Array<{ id: string; title: string; message: string; read: boolean; created_at: string; data: any }>
  stats: { views_30d: number; rfqs_received: number; rfqs_responded: number; unread_notifs: number }
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  received: { label: 'New — Action Required', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  quoted:   { label: 'Quote Sent', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  accepted: { label: 'Accepted', color: 'bg-green-50 text-green-700 border-green-200' },
  declined: { label: 'Declined', color: 'bg-slate-50 text-slate-500 border-slate-200' },
  expired:  { label: 'Expired', color: 'bg-red-50 text-red-600 border-red-200' },
}

const TIER_CONFIG: Record<string, { label: string; color: string; nextTier?: string }> = {
  free:       { label: 'Free Listing', color: 'bg-slate-100 text-slate-600', nextTier: 'standard' },
  standard:   { label: 'Standard', color: 'bg-blue-100 text-blue-700', nextTier: 'featured' },
  featured:   { label: 'Featured Partner', color: 'bg-orange-100 text-orange-700' },
  enterprise: { label: 'Enterprise', color: 'bg-purple-100 text-purple-700' },
}

export default function VendorPortalPage() {
  const [data, setData] = useState<VendorPortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'rfqs' | 'notifications' | 'subscription'>('rfqs')
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [quoteForm, setQuoteForm] = useState({ amount: '', currency: 'INR', message: '' })
  const router = useRouter()

  useEffect(() => {
    loadPortalData()
  }, [])

  const loadPortalData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login?redirect=/vendor/portal'); return }

    // Get vendor listing for this user
    const { data: vendor } = await supabase
      .from('vendors')
      .select('id,company_name,slug,tier,verified,featured,views_count,rfq_count,membership_expires_at,email,is_active')
      .eq('profile_id', user.id)
      .single()

    if (!vendor) {
      // No vendor listing — redirect to onboard
      router.push('/vendor/onboard')
      return
    }

    // Get RFQ responses for this vendor
    const { data: rfqs } = await supabase
      .from('rfq_responses')
      .select(`
        id, rfq_id, status, quote_amount, quote_currency, message, responded_at,
        rfqs (rfq_number, equipment_category, site_region, urgency, required_capacity, project_description, created_at)
      `)
      .eq('vendor_id', vendor.id)
      .order('responded_at', { ascending: false })
      .limit(20) as any

    // Get notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id, title, message, read, created_at, data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    // Get vendor events for analytics (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: events } = await supabase
      .from('vendor_events')
      .select('event_type')
      .eq('vendor_id', vendor.id)
      .gte('created_at', thirtyDaysAgo.toISOString())

    const views30d = events?.filter(e => e.event_type === 'view').length ?? 0
    const unreadNotifs = notifications?.filter(n => !n.read).length ?? 0

    setData({
      vendor,
      rfqs: rfqs ?? [],
      notifications: notifications ?? [],
      stats: {
        views_30d: views30d,
        rfqs_received: vendor.rfq_count,
        rfqs_responded: rfqs?.filter((r: any) => r.status === 'quoted').length ?? 0,
        unread_notifs: unreadNotifs,
      },
    })
    setLoading(false)
  }

  const submitQuote = async (rfqId: string, rfqResponseId: string) => {
    if (!quoteForm.amount || !quoteForm.message) {
      toast.error('Please enter a quote amount and message')
      return
    }
    if (!data?.vendor) return

    try {
      const { error } = await supabase.from('rfq_responses').update({
        status: 'quoted',
        quote_amount: parseFloat(quoteForm.amount),
        quote_currency: quoteForm.currency,
        message: quoteForm.message,
        responded_at: new Date().toISOString(),
      }).eq('id', rfqResponseId)

      if (error) throw error

      toast.success('Quote submitted successfully!')
      setRespondingTo(null)
      setQuoteForm({ amount: '', currency: 'INR', message: '' })
      loadPortalData()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const markNotificationsRead = async () => {
    if (!data) return
    const unreadIds = data.notifications.filter(n => !n.read).map(n => n.id)
    if (!unreadIds.length) return
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
    setData(prev => prev ? {
      ...prev,
      notifications: prev.notifications.map(n => ({ ...n, read: true })),
      stats: { ...prev.stats, unread_notifs: 0 },
    } : null)
  }

  const signOut = async () => { await supabase.auth.signOut(); router.push('/') }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading your portal...</p>
      </div>
    </div>
  )

  if (!data?.vendor) return null

  const { vendor, rfqs, notifications, stats } = data
  const tierCfg = TIER_CONFIG[vendor.tier] ?? TIER_CONFIG.free
  const membershipExpiry = vendor.membership_expires_at ? new Date(vendor.membership_expires_at) : null
  const isExpired = membershipExpiry ? membershipExpiry < new Date() : false
  const newRFQs = rfqs.filter(r => r.status === 'received')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOP NAV */}
      <header className="bg-navy-950 border-b border-white/5">
        <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">HM</span>
            </div>
            <span className="text-white font-bold text-sm">Hoist<span className="text-orange-500">Market</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs hidden sm:block">{vendor.company_name}</span>
            <Link href={`/directory/${vendor.slug}`} className="text-slate-400 hover:text-white text-xs transition-colors">
              View Listing →
            </Link>
            <button onClick={signOut} className="flex items-center gap-1.5 text-slate-500 hover:text-white text-xs transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-extrabold text-navy-900">{vendor.company_name}</h1>
              {vendor.verified && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified
                </span>
              )}
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tierCfg.color}`}>
                {tierCfg.label}
              </span>
            </div>
            <p className="text-slate-500 text-sm">Vendor Portal · Manage your RFQs, quotes, and subscription</p>
          </div>
          {!vendor.verified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
              <strong>Pending verification.</strong> Our team reviews listings within 2–3 business days.
            </div>
          )}
        </div>

        {/* ALERT: New RFQs */}
        {newRFQs.length > 0 && (
          <div className="mb-6 bg-orange-500 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Inbox className="w-5 h-5 text-white flex-shrink-0" />
              <span className="text-white font-bold text-sm">
                {newRFQs.length} new RFQ{newRFQs.length > 1 ? 's' : ''} waiting for your response
              </span>
            </div>
            <button onClick={() => setActiveTab('rfqs')} className="text-white/90 hover:text-white text-xs font-bold underline">
              View now →
            </button>
          </div>
        )}

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Profile Views (30d)', value: stats.views_30d, icon: Eye, color: 'text-blue-500 bg-blue-50' },
            { label: 'RFQs Received', value: stats.rfqs_received, icon: Inbox, color: 'text-orange-500 bg-orange-50' },
            { label: 'Quotes Submitted', value: stats.rfqs_responded, icon: MessageSquare, color: 'text-green-500 bg-green-50' },
            { label: 'Unread Notifications', value: stats.unread_notifs, icon: Bell, color: 'text-purple-500 bg-purple-50' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className={`w-9 h-9 rounded-lg ${k.color} flex items-center justify-center mb-3`}>
                <k.icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold text-navy-900 mb-1">{k.value}</div>
              <div className="text-xs text-slate-500">{k.label}</div>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 mb-6 gap-1">
          {[
            { id: 'rfqs', label: 'RFQ Inbox', count: newRFQs.length },
            { id: 'notifications', label: 'Notifications', count: stats.unread_notifs },
            { id: 'subscription', label: 'Subscription' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as typeof activeTab); if (tab.id === 'notifications') markNotificationsRead() }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === tab.id ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {(tab.count ?? 0) > 0 && (
                <span className="w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* RFQ INBOX */}
        {activeTab === 'rfqs' && (
          <div className="space-y-4">
            {rfqs.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <Inbox className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <h3 className="font-bold text-navy-900 mb-1">No RFQs yet</h3>
                <p className="text-slate-500 text-sm mb-4">
                  {vendor.verified
                    ? 'You\'ll receive RFQs when buyers search for your equipment categories in your region.'
                    : 'Complete verification to start receiving matched RFQs.'}
                </p>
                {!vendor.verified && (
                  <p className="text-xs text-slate-400">Verification usually takes 2–3 business days.</p>
                )}
              </div>
            ) : (
              rfqs.map((response: any) => {
                const rfq = response.rfqs
                const statusCfg = STATUS_CONFIG[response.status] ?? STATUS_CONFIG.received
                const isNew = response.status === 'received'
                const isResponding = respondingTo === response.id

                return (
                  <div key={response.id} className={`bg-white rounded-xl border-2 overflow-hidden ${isNew ? 'border-orange-200' : 'border-slate-100'}`}>
                    {isNew && <div className="h-0.5 bg-orange-500" />}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono text-xs font-bold text-navy-900 bg-slate-100 px-2 py-0.5 rounded">
                              {rfq.rfq_number}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.color}`}>
                              {statusCfg.label}
                            </span>
                            <span className={`text-xs font-bold ${
                              rfq.urgency === 'urgent' ? 'text-red-600' :
                              rfq.urgency === 'high' ? 'text-orange-600' : 'text-slate-500'
                            }`}>
                              {rfq.urgency.charAt(0).toUpperCase() + rfq.urgency.slice(1)} priority
                            </span>
                          </div>
                          <h3 className="font-bold text-navy-900 text-base">{rfq.equipment_category}</h3>
                          <p className="text-slate-500 text-sm">{rfq.site_region} {rfq.required_capacity ? `· ${rfq.required_capacity}` : ''}</p>
                        </div>
                        <div className="text-xs text-slate-400 flex-shrink-0">
                          {new Date(rfq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </div>
                      </div>

                      {rfq.project_description && (
                        <p className="text-sm text-slate-600 leading-relaxed mb-4 bg-slate-50 rounded-lg px-4 py-3">
                          {rfq.project_description}
                        </p>
                      )}

                      {/* Quote already submitted */}
                      {response.status === 'quoted' && response.quote_amount && (
                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Your Quote</div>
                          <div className="text-lg font-extrabold text-blue-900">
                            {response.quote_currency} {response.quote_amount.toLocaleString()}
                          </div>
                          {response.message && (
                            <p className="text-sm text-blue-700 mt-1 italic">"{response.message}"</p>
                          )}
                        </div>
                      )}

                      {/* Respond form */}
                      {isNew && (
                        isResponding ? (
                          <div className="mt-3 bg-slate-50 rounded-xl p-4 space-y-3">
                            <h4 className="font-bold text-navy-900 text-sm">Submit Your Quote</h4>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="col-span-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Quote Amount *</label>
                                <input
                                  type="number"
                                  value={quoteForm.amount}
                                  onChange={e => setQuoteForm(p => ({ ...p, amount: e.target.value }))}
                                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                  placeholder="e.g. 250000"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Currency</label>
                                <select
                                  value={quoteForm.currency}
                                  onChange={e => setQuoteForm(p => ({ ...p, currency: e.target.value }))}
                                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                  <option>INR</option><option>USD</option><option>AED</option><option>NGN</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Message / Scope Notes *</label>
                              <textarea
                                value={quoteForm.message}
                                onChange={e => setQuoteForm(p => ({ ...p, message: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                placeholder="Describe what's included in your quote, timeline, any conditions..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => submitQuote(response.rfq_id, response.id)}
                                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors"
                              >
                                Submit Quote
                              </button>
                              <button
                                onClick={() => setRespondingTo(null)}
                                className="px-4 py-2.5 border border-slate-200 text-slate-600 font-medium text-sm rounded-lg hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRespondingTo(response.id)}
                            className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-all hover:-translate-y-px"
                          >
                            <DollarSign className="w-4 h-4" /> Submit Quote
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-4 flex items-start gap-3 ${!n.read ? 'bg-orange-50/50' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.read ? 'bg-orange-500' : 'bg-slate-200'}`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-navy-900">{n.title}</p>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                    {n.data?.rfq_id && (
                      <button
                        onClick={() => setActiveTab('rfqs')}
                        className="mt-2 text-xs font-bold text-orange-500 hover:text-orange-600"
                      >
                        View RFQ →
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SUBSCRIPTION */}
        {activeTab === 'subscription' && (
          <div className="space-y-5">
            {/* Current plan */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-navy-900 mb-4">Current Plan</h3>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className={`inline-flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-full ${tierCfg.color} mb-2`}>
                    {vendor.tier === 'featured' && <Star className="w-3.5 h-3.5 fill-current" />}
                    {tierCfg.label}
                  </div>
                  {membershipExpiry && (
                    <p className={`text-sm ${isExpired ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                      {isExpired ? '⚠️ Expired on ' : 'Valid until '}
                      {membershipExpiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  {!membershipExpiry && vendor.tier === 'free' && (
                    <p className="text-slate-500 text-sm">Free forever — upgrade to receive RFQs</p>
                  )}
                </div>
                {vendor.tier === 'free' && (
                  <Link href="/advertise" className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors">
                    Upgrade Plan →
                  </Link>
                )}
              </div>
            </div>

            {/* Plan comparison */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-navy-900 mb-5">Available Plans</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    tier: 'standard', label: 'Standard', price_inr: '₹5,000/yr', price_usd: '$60/yr',
                    features: ['✓ Verified badge', 'Up to 10 RFQs/month', 'Enhanced listing', 'Analytics dashboard'],
                    current: vendor.tier === 'standard',
                  },
                  {
                    tier: 'featured', label: 'Featured', price_inr: '₹18,000/yr', price_usd: '$216/yr',
                    features: ['⭐ Homepage placement', 'Unlimited RFQs', 'Priority routing', 'Sidebar CTA', 'Monthly report'],
                    current: vendor.tier === 'featured', highlight: true,
                  },
                  {
                    tier: 'enterprise', label: 'Enterprise', price_inr: 'Custom', price_usd: 'Custom',
                    features: ['Custom partnership', 'Dedicated AM', 'Content sponsorship', 'White-glove support'],
                    current: vendor.tier === 'enterprise',
                  },
                ].map(plan => (
                  <div key={plan.tier} className={`rounded-xl border-2 p-5 ${plan.highlight ? 'border-orange-400' : 'border-slate-200'} ${plan.current ? 'opacity-60' : ''}`}>
                    <div className="font-bold text-navy-900 mb-1">{plan.label}</div>
                    <div className="text-2xl font-extrabold text-orange-500 mb-1">{plan.price_inr}</div>
                    <div className="text-xs text-slate-400 mb-4">{plan.price_usd}</div>
                    <ul className="space-y-1.5 mb-5">
                      {plan.features.map(f => <li key={f} className="text-xs text-slate-600">{f}</li>)}
                    </ul>
                    {plan.current ? (
                      <div className="w-full text-center py-2 text-sm font-semibold text-slate-400 bg-slate-50 rounded-lg border">Current Plan</div>
                    ) : plan.tier === 'enterprise' ? (
                      <a href="mailto:info@hoistmarket.com" className="block w-full text-center py-2.5 border-2 border-navy-900 text-navy-900 font-bold text-sm rounded-lg hover:bg-navy-900 hover:text-white transition-colors">
                        Contact Us
                      </a>
                    ) : (
                      <Link href="/advertise" className="block w-full text-center py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors">
                        Upgrade →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
