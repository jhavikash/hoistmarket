'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  CheckCircle, XCircle, Search, RefreshCw, Eye, Edit3,
  Building2, MapPin, Mail, Phone, Globe, Shield, Star,
  ChevronDown, X, Save, AlertTriangle, Users, TrendingUp
} from 'lucide-react'
import { supabase as _sb } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = _sb as any

type Vendor = {
  id: string
  company_name: string
  slug: string
  description: string | null
  country: string
  city: string
  region: string
  equipment_categories: string[]
  tier: string
  verified: boolean
  featured: boolean
  logo_url: string | null
  website: string | null
  email: string
  phone: string | null
  whatsapp: string | null
  certifications: string[]
  specializations: string[]
  year_established: number | null
  employee_count: string | null
  views_count: number
  rfq_count: number
  is_active: boolean
  admin_notes: string | null
  membership_expires_at: string | null
  profile_id: string | null
  created_at: string
}

const TIER_CONFIG = {
  free:       { label: 'Free',       color: 'bg-slate-100 text-slate-600 border-slate-200' },
  standard:   { label: 'Standard',   color: 'bg-blue-50 text-blue-700 border-blue-200' },
  featured:   { label: 'Featured',   color: 'bg-orange-100 text-orange-700 border-orange-200' },
  enterprise: { label: 'Enterprise', color: 'bg-purple-100 text-purple-700 border-purple-200' },
}

const TIERS = ['free', 'standard', 'featured', 'enterprise'] as const
const REGIONS = ['india', 'gcc', 'africa', 'asia', 'europe', 'americas'] as const

export default function AdminVendorsPage() {
  const [vendors, setVendors]     = useState<Vendor[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'pending'>('all')
  const [filterTier, setFilterTier] = useState('all')
  const [selected, setSelected]   = useState<Vendor | null>(null)
  const [editMode, setEditMode]   = useState(false)
  const [editData, setEditData]   = useState<Partial<Vendor>>({})
  const [saving, setSaving]       = useState(false)
  const [adminNotes, setAdminNotes] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) { toast.error(error.message); setLoading(false); return }
    setVendors(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = vendors.filter(v => {
    const matchSearch = !search ||
      v.company_name.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase())
    const matchVerified =
      filterVerified === 'all' ? true :
      filterVerified === 'verified' ? v.verified :
      !v.verified
    const matchTier = filterTier === 'all' || v.tier === filterTier
    return matchSearch && matchVerified && matchTier
  })

  const handleApprove = async (vendor: Vendor) => {
    const { error } = await supabase
      .from('vendors')
      .update({ verified: true, admin_notes: adminNotes || vendor.admin_notes })
      .eq('id', vendor.id)
    if (error) { toast.error(error.message); return }

    // Notify vendor if they have a profile
    if (vendor.profile_id) {
      await supabase.from('notifications').insert({
        user_id: vendor.profile_id,
        type: 'vendor_approved',
        title: 'Your listing is now Verified!',
        message: `${vendor.company_name} has been verified on HoistMarket. You will now receive matched RFQs from buyers in your region.`,
        data: { vendor_id: vendor.id },
      })
    }

    toast.success(`${vendor.company_name} approved and verified`)
    load()
    if (selected?.id === vendor.id) setSelected(prev => prev ? { ...prev, verified: true } : null)
  }

  const handleSuspend = async (vendor: Vendor) => {
    if (!confirm(`Suspend ${vendor.company_name}? They will lose verified status and be hidden from directory.`)) return
    const { error } = await supabase
      .from('vendors')
      .update({ is_active: false, verified: false, admin_notes: adminNotes || 'Suspended by admin' })
      .eq('id', vendor.id)
    if (error) { toast.error(error.message); return }
    toast.success(`${vendor.company_name} suspended`)
    load()
    setSelected(null)
  }

  const handleTierChange = async (vendor: Vendor, newTier: string) => {
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)

    const { error } = await supabase.from('vendors').update({
      tier: newTier,
      featured: newTier === 'featured' || newTier === 'enterprise',
      membership_expires_at: newTier !== 'free' ? expiresAt.toISOString() : null,
    }).eq('id', vendor.id)

    if (error) { toast.error(error.message); return }

    // If upgrading, create membership record
    if (newTier !== 'free') {
      const PRICES: Record<string, { inr: number; usd: number }> = {
        standard: { inr: 5000, usd: 60 },
        featured: { inr: 18000, usd: 216 },
        enterprise: { inr: 60000, usd: 720 },
      }
      const price = PRICES[newTier]
      if (price) {
        await supabase.from('memberships').insert({
          vendor_id: vendor.id,
          tier: newTier as 'standard' | 'featured' | 'enterprise',
          price_inr: price.inr,
          price_usd: price.usd,
          billing_cycle: 'annual',
          status: 'active',
          starts_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
        })
      }
    }

    toast.success(`Tier updated to ${newTier}`)
    load()
    if (selected?.id === vendor.id) setSelected(prev => prev ? { ...prev, tier: newTier, featured: newTier === 'featured' || newTier === 'enterprise' } : null)
  }

  const handleSaveNotes = async (vendor: Vendor) => {
    setSaving(true)
    const { error } = await supabase
      .from('vendors')
      .update({ admin_notes: adminNotes })
      .eq('id', vendor.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Notes saved')
    load()
  }

  const handleSaveEdit = async () => {
    if (!selected) return
    setSaving(true)
    const { error } = await supabase.from('vendors').update(editData).eq('id', selected.id)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Vendor updated')
    setEditMode(false)
    load()
    setSelected(prev => prev ? { ...prev, ...editData } : null)
  }

  const selectVendor = (v: Vendor) => {
    setSelected(v)
    setAdminNotes(v.admin_notes ?? '')
    setEditData({
      company_name: v.company_name, description: v.description ?? '',
      email: v.email, phone: v.phone ?? '', website: v.website ?? '',
      year_established: v.year_established ?? undefined, employee_count: v.employee_count ?? '',
    })
    setEditMode(false)
  }

  const stats = {
    total: vendors.length,
    verified: vendors.filter(v => v.verified).length,
    pending: vendors.filter(v => !v.verified && v.is_active).length,
    featured: vendors.filter(v => v.tier === 'featured' || v.tier === 'enterprise').length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-navy-900">Vendor Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Review, approve, and manage all vendor listings</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Vendors',      value: stats.total,    icon: Building2,   color: 'text-slate-500 bg-slate-50' },
          { label: 'Verified',           value: stats.verified, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Pending Approval',   value: stats.pending,  icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
          { label: 'Paid Tier (feat/ent)', value: stats.featured, icon: Star,       color: 'text-purple-600 bg-purple-50' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-8 h-8 rounded-lg ${k.color} flex items-center justify-center mb-2.5`}>
              <k.icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-navy-900">{k.value}</div>
            <div className="text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-5 h-[calc(100vh-280px)] min-h-[500px]">
        {/* LEFT: Vendor list */}
        <div className="w-80 flex-shrink-0 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Filters */}
          <div className="p-3 border-b border-slate-100 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search vendors..."
                className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
              />
            </div>
            <div className="flex gap-2">
              <select value={filterVerified} onChange={e => setFilterVerified(e.target.value as any)}
                className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
              </select>
              <select value={filterTier} onChange={e => setFilterTier(e.target.value)}
                className="flex-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="all">All Tiers</option>
                {TIERS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">No vendors found</div>
            ) : filtered.map(v => (
              <button
                key={v.id}
                onClick={() => selectVendor(v)}
                className={`w-full text-left px-3 py-3 hover:bg-slate-50 transition-colors ${selected?.id === v.id ? 'bg-orange-50 border-l-2 border-orange-500' : ''}`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-navy-900 text-sm truncate flex-1">{v.company_name}</span>
                  {v.verified
                    ? <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    : <AlertTriangle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                  }
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" />{v.city}, {v.country}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${TIER_CONFIG[v.tier as keyof typeof TIER_CONFIG]?.color ?? TIER_CONFIG.free.color}`}>
                    {v.tier}
                  </span>
                  {!v.is_active && <span className="text-xs text-red-500 font-semibold">Suspended</span>}
                </div>
              </button>
            ))}
          </div>

          <div className="px-3 py-2 border-t border-slate-100 text-xs text-slate-400 text-center">
            {filtered.length} of {vendors.length} vendors
          </div>
        </div>

        {/* RIGHT: Vendor detail */}
        <div className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="h-full flex items-center justify-center bg-white rounded-xl border border-slate-200">
              <div className="text-center">
                <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Select a vendor to view details</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Vendor Header */}
              <div className="bg-navy-900 px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h2 className="text-white font-bold text-lg">{selected.company_name}</h2>
                      {selected.verified
                        ? <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Verified</span>
                        : <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3" /> Pending</span>
                      }
                    </div>
                    <p className="text-slate-400 text-sm">{selected.city}, {selected.country} · {selected.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setEditMode(!editMode)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${editMode ? 'bg-orange-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                      <Edit3 className="w-3.5 h-3.5" /> {editMode ? 'Editing...' : 'Edit'}
                    </button>
                    <a href={`/directory/${selected.slug}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-colors">
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Profile Views', value: selected.views_count },
                    { label: 'RFQs Received', value: selected.rfq_count },
                    { label: 'Est. Since', value: selected.year_established ?? 'N/A' },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-xl px-4 py-3 text-center">
                      <div className="text-xl font-extrabold text-navy-900">{s.value}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Edit fields or read-only view */}
                {editMode ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-navy-900">Edit Vendor Details</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Company Name</label>
                        <input value={editData.company_name ?? ''} onChange={e => setEditData(p => ({ ...p, company_name: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Email</label>
                        <input value={editData.email ?? ''} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Phone</label>
                        <input value={editData.phone ?? ''} onChange={e => setEditData(p => ({ ...p, phone: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Website</label>
                        <input value={editData.website ?? ''} onChange={e => setEditData(p => ({ ...p, website: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Description</label>
                      <textarea value={editData.description ?? ''} onChange={e => setEditData(p => ({ ...p, description: e.target.value }))}
                        rows={3} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleSaveEdit} disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors disabled:opacity-60">
                        {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                      </button>
                      <button onClick={() => setEditMode(false)}
                        className="px-4 py-2 border border-slate-200 text-slate-600 font-medium text-sm rounded-lg hover:bg-slate-50 transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Categories */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Equipment Categories</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.equipment_categories.map(c => (
                          <span key={c} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">{c}</span>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    {selected.certifications?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Certifications</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.certifications.map(c => (
                            <span key={c} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-200 font-medium">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        { icon: Mail, val: selected.email },
                        { icon: Phone, val: selected.phone ?? '—' },
                        { icon: Globe, val: selected.website ?? '—' },
                        { icon: MapPin, val: `${selected.city}, ${selected.country}` },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-600">
                          <item.icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate text-xs">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Tier Management */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Membership Tier</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {TIERS.map(tier => (
                      <button
                        key={tier}
                        onClick={() => handleTierChange(selected, tier)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                          selected.tier === tier
                            ? 'bg-orange-500 text-white border-orange-500'
                            : `${TIER_CONFIG[tier].color} hover:border-orange-400`
                        }`}
                      >
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        {selected.tier === tier && ' ✓'}
                      </button>
                    ))}
                  </div>
                  {selected.membership_expires_at && (
                    <p className="text-xs text-slate-400 mt-2">
                      Expires: {new Date(selected.membership_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Admin Notes */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Admin Notes (internal)</p>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    rows={3}
                    placeholder="Internal notes — not visible to vendor..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white resize-none"
                  />
                  <button onClick={() => handleSaveNotes(selected)} disabled={saving}
                    className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Actions</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {!selected.verified && selected.is_active && (
                      <button onClick={() => handleApprove(selected)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-lg transition-colors">
                        <CheckCircle className="w-4 h-4" /> Approve & Verify
                      </button>
                    )}
                    {selected.verified && (
                      <button onClick={async () => {
                        await supabase.from('vendors').update({ verified: false }).eq('id', selected.id)
                        toast.success('Verification removed')
                        load()
                        setSelected(p => p ? { ...p, verified: false } : null)
                      }} className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-sm rounded-lg transition-colors">
                        <XCircle className="w-4 h-4" /> Remove Verification
                      </button>
                    )}
                    {selected.is_active ? (
                      <button onClick={() => handleSuspend(selected)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm rounded-lg border border-red-200 transition-colors">
                        <Shield className="w-4 h-4" /> Suspend Vendor
                      </button>
                    ) : (
                      <button onClick={async () => {
                        await supabase.from('vendors').update({ is_active: true }).eq('id', selected.id)
                        toast.success('Vendor reactivated')
                        load()
                        setSelected(p => p ? { ...p, is_active: true } : null)
                      }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-sm rounded-lg border border-blue-200 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Reactivate Vendor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
