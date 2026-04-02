'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Eye, MousePointerClick, Calendar, DollarSign,
  ToggleLeft, ToggleRight, Trash2, Edit3, BarChart2, TrendingUp
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface Ad {
  id: string
  title: string
  description: string | null
  cta_text: string
  cta_url: string
  placement: string
  price_per_month: number
  currency: string
  starts_at: string
  ends_at: string
  is_active: boolean
  impressions: number
  clicks: number
  vendor_id: string | null
}

const PLACEMENT_LABELS: Record<string, { label: string; price: number; desc: string }> = {
  homepage_banner:    { label: 'Homepage Banner',        price: 18000, desc: 'Full-width banner on homepage' },
  kb_sidebar:         { label: 'Knowledge Base Sidebar', price: 8500,  desc: 'Sticky widget in article sidebars' },
  directory_featured: { label: 'Directory Featured',     price: 12000, desc: 'Top of directory search results' },
  article_inline:     { label: 'Article Inline CTA',     price: 5000,  desc: 'Contextual block within articles' },
}

const EMPTY_FORM = {
  title: '', description: '', cta_text: 'Learn More', cta_url: '',
  placement: 'homepage_banner', price_per_month: 18000, currency: 'INR',
  starts_at: '', ends_at: '', is_active: true, vendor_id: '',
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => { fetchAds() }, [])

  const fetchAds = async () => {
    const { data } = await supabase
      .from('ad_placements')
      .select('*')
      .order('created_at', { ascending: false })
    setAds(data || [])
    setLoading(false)
  }

  const totalRevenue = ads.reduce((s, a) => {
    const months = Math.max(1, Math.round(
      (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / (30 * 24 * 60 * 60 * 1000)
    ))
    return s + a.price_per_month * months
  }, 0)

  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0)
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0)
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0'

  const handleToggle = async (ad: Ad) => {
    const { error } = await supabase
      .from('ad_placements')
      .update({ is_active: !ad.is_active })
      .eq('id', ad.id)
    if (error) { toast.error('Update failed'); return }
    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: !a.is_active } : a))
    toast.success(`Ad ${ad.is_active ? 'paused' : 'activated'}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ad placement?')) return
    const { error } = await supabase.from('ad_placements').delete().eq('id', id)
    if (error) { toast.error('Delete failed'); return }
    setAds(prev => prev.filter(a => a.id !== id))
    toast.success('Ad placement deleted')
  }

  const handleEdit = (ad: Ad) => {
    setForm({
      title: ad.title, description: ad.description || '', cta_text: ad.cta_text,
      cta_url: ad.cta_url, placement: ad.placement,
      price_per_month: ad.price_per_month, currency: ad.currency,
      starts_at: ad.starts_at.split('T')[0], ends_at: ad.ends_at.split('T')[0],
      is_active: ad.is_active, vendor_id: ad.vendor_id || '',
    })
    setEditingId(ad.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.cta_url || !form.starts_at || !form.ends_at) {
      toast.error('Please fill in all required fields')
      return
    }
    const payload = {
      ...form,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      vendor_id: form.vendor_id || null,
      description: form.description || null,
    }
    if (editingId) {
      const { error } = await supabase.from('ad_placements').update(payload).eq('id', editingId)
      if (error) { toast.error(error.message); return }
      toast.success('Ad placement updated')
    } else {
      const { error } = await supabase.from('ad_placements').insert(payload)
      if (error) { toast.error(error.message); return }
      toast.success('Ad placement created')
    }
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    fetchAds()
  }

  const isLive = (ad: Ad) => {
    const now = new Date()
    return ad.is_active && new Date(ad.starts_at) <= now && new Date(ad.ends_at) >= now
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-navy-900">Ad Placements</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage sponsored banners, sidebar widgets, and inline CTAs</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New Placement
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Placements', value: ads.filter(isLive).length, icon: BarChart2, color: 'text-green-500 bg-green-50' },
          { label: 'Total Ad Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-orange-500 bg-orange-50' },
          { label: 'Total Impressions', value: totalImpressions.toLocaleString(), icon: Eye, color: 'text-blue-500 bg-blue-50' },
          { label: 'Avg CTR', value: `${avgCTR}%`, icon: TrendingUp, color: 'text-purple-500 bg-purple-50' },
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

      {/* Placement Pricing Reference */}
      <div className="bg-white rounded-xl border border-slate-200 mb-6">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-navy-900 text-sm">Placement Pricing Reference</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
          {Object.entries(PLACEMENT_LABELS).map(([key, val]) => (
            <div key={key} className="px-5 py-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{val.label}</div>
              <div className="text-xl font-extrabold text-orange-500 mb-0.5">₹{val.price.toLocaleString('en-IN')}<span className="text-sm text-slate-400 font-normal">/mo</span></div>
              <div className="text-xs text-slate-500">{val.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ad Placement Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-navy-900 text-sm">
              {editingId ? 'Edit Ad Placement' : 'Create New Ad Placement'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Ad Title *</label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g. Konecranes India — Certified Service Partner"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y min-h-[72px]"
                placeholder="Short description shown below the headline..."
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">CTA Button Text *</label>
              <input
                value={form.cta_text}
                onChange={e => setForm(p => ({ ...p, cta_text: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Learn More"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">CTA URL *</label>
              <input
                value={form.cta_url}
                onChange={e => setForm(p => ({ ...p, cta_url: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://... or /directory/..."
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Placement *</label>
              <select
                value={form.placement}
                onChange={e => {
                  const p = e.target.value
                  setForm(prev => ({ ...prev, placement: p, price_per_month: PLACEMENT_LABELS[p]?.price || 0 }))
                }}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {Object.entries(PLACEMENT_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label} — ₹{val.price.toLocaleString('en-IN')}/mo</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Monthly Rate (₹)</label>
              <input
                type="number"
                value={form.price_per_month}
                onChange={e => setForm(p => ({ ...p, price_per_month: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Start Date *</label>
              <input
                type="date"
                value={form.starts_at}
                onChange={e => setForm(p => ({ ...p, starts_at: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">End Date *</label>
              <input
                type="date"
                value={form.ends_at}
                onChange={e => setForm(p => ({ ...p, ends_at: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm font-medium text-slate-700">Active immediately</span>
              </label>
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button onClick={handleSave} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors">
                {editingId ? 'Save Changes' : 'Create Placement'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null) }} className="px-5 py-2.5 border border-slate-200 text-slate-600 font-medium text-sm rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ads Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-navy-900 text-sm">All Placements ({ads.length})</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Loading...</div>
        ) : ads.length === 0 ? (
          <div className="text-center py-12">
            <BarChart2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No ad placements yet</p>
            <button onClick={() => { setForm(EMPTY_FORM); setShowForm(true) }} className="mt-3 px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg">
              Create First Placement
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {['Ad Title', 'Placement', 'Period', 'Rate', 'Impressions', 'Clicks', 'CTR', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ads.map(ad => {
                  const live = isLive(ad)
                  const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0'
                  const months = Math.max(1, Math.round(
                    (new Date(ad.ends_at).getTime() - new Date(ad.starts_at).getTime()) / (30 * 24 * 60 * 60 * 1000)
                  ))
                  return (
                    <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-navy-900 text-sm max-w-[180px] truncate">{ad.title}</div>
                        {ad.description && <div className="text-xs text-slate-400 truncate max-w-[180px]">{ad.description}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
                          {PLACEMENT_LABELS[ad.placement]?.label || ad.placement}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        <div>{new Date(ad.starts_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                        <div>→ {new Date(ad.ends_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-navy-900">₹{ad.price_per_month.toLocaleString('en-IN')}/mo</div>
                        <div className="text-xs text-slate-400">₹{(ad.price_per_month * months).toLocaleString('en-IN')} total</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {ad.impressions.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MousePointerClick className="w-3.5 h-3.5 text-slate-400" />
                          {ad.clicks.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold text-sm ${parseFloat(ctr) >= 2 ? 'text-green-600' : parseFloat(ctr) >= 1 ? 'text-orange-500' : 'text-slate-400'}`}>
                          {ctr}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${
                          live ? 'bg-green-50 text-green-700 border-green-200'
                          : ad.is_active ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {live ? '● Live' : ad.is_active ? '⏸ Paused' : '○ Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEdit(ad)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleToggle(ad)} className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors" title={ad.is_active ? 'Pause' : 'Activate'}>
                            {ad.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleDelete(ad.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
