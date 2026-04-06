'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Inbox, Search, Filter, Send, Eye, CheckCircle, AlertCircle, Clock,
  X, Zap, Mail, Phone, Building2, MapPin, Package, ChevronDown,
  DollarSign, RefreshCw, Users
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

type RFQ = {
  id: string; rfq_number: string; requester_name: string
  requester_email: string; requester_company: string | null
  requester_phone: string | null; equipment_category: string
  required_capacity: string | null; capacity_unit: string | null
  span_required: string | null; lift_height: string | null
  duty_class: string | null; site_region: string; site_country: string | null
  rental_duration: string | null; project_description: string | null
  budget_range: string | null; special_requirements: string | null
  urgency: string; status: string; admin_notes: string | null
  matched_vendor_ids: string[]; dispatched_to: string[]
  dispatched_at: string | null; expected_commission: number | null
  commission_currency: string; commission_status: string
  actual_deal_value: number | null; created_at: string
}

type Vendor = {
  id: string; company_name: string; email: string; city: string
  country: string; tier: string; verified: boolean; rfq_count: number
  equipment_categories: string[]
}

const S: Record<string, { label: string; color: string; bg: string }> = {
  new:        { label: 'New',         color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  reviewing:  { label: 'Reviewing',   color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  matched:    { label: 'Matched',     color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
  dispatched: { label: 'Dispatched',  color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  in_progress:{ label: 'In Progress', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  closed:     { label: 'Closed',      color: 'text-slate-600',  bg: 'bg-slate-50 border-slate-200' },
  cancelled:  { label: 'Cancelled',   color: 'text-red-600',    bg: 'bg-red-50 border-red-200' },
}

export default function AdminLeadsPage() {
  const [rfqs, setRfqs]               = useState<RFQ[]>([])
  const [vendors, setVendors]         = useState<Vendor[]>([])
  const [selected, setSelected]       = useState<RFQ | null>(null)
  const [loading, setLoading]         = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQ, setSearchQ]         = useState('')
  const [dispatchIds, setDispatchIds] = useState<string[]>([])
  const [dispatchMsg, setDispatchMsg] = useState('')
  const [dispatching, setDispatching] = useState(false)
  const [notes, setNotes]             = useState('')
  const [commission, setCommission]   = useState('')
  const [dealValue, setDealValue]     = useState('')
  const [saving, setSaving]           = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: rfqData } = await supabase
        .from('rfqs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      setRfqs(rfqData ?? [])

      const { data: vData } = await supabase
        .from('vendors')
        .select('id,company_name,email,city,country,tier,verified,rfq_count,equipment_categories')
        .eq('is_active', true)
        .order('tier', { ascending: false })
      setVendors(vData ?? [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // When selecting an RFQ, pre-select matched vendors
  const selectRFQ = (rfq: RFQ) => {
    setSelected(rfq)
    setDispatchIds(rfq.matched_vendor_ids ?? [])
    setDispatchMsg('')
    setNotes(rfq.admin_notes ?? '')
    setCommission(rfq.expected_commission?.toString() ?? '')
    setDealValue(rfq.actual_deal_value?.toString() ?? '')
  }

  const dispatch = async () => {
    if (!selected || dispatchIds.length === 0) {
      toast.error('Select at least one vendor to dispatch to')
      return
    }
    setDispatching(true)
    try {
      const res = await fetch('/api/rfq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: selected.id,
          vendorIds: dispatchIds,
          message: dispatchMsg || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(`RFQ dispatched to ${json.dispatched} vendor${json.dispatched > 1 ? 's' : ''}`)
      await load()
      setSelected(null)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setDispatching(false)
    }
  }

  const saveUpdates = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const updates: Record<string, any> = {}
      if (notes !== selected.admin_notes) updates.admin_notes = notes || null
      if (commission) updates.expected_commission = parseFloat(commission)
      if (dealValue) {
        updates.actual_deal_value = parseFloat(dealValue)
        updates.commission_status = 'received'
        updates.commission_received_at = new Date().toISOString()
      }

      const res = await fetch('/api/rfq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfqId: selected.id, statusUpdate: updates }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success('Updates saved')
      await load()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (rfqId: string, status: string) => {
    const res = await fetch('/api/rfq', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfqId, statusUpdate: { status } }),
    })
    if (res.ok) { toast.success(`Status → ${status}`); load() }
    else toast.error((await res.json()).error)
  }

  const filtered = rfqs.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false
    if (searchQ) {
      const q = searchQ.toLowerCase()
      return r.rfq_number.toLowerCase().includes(q) ||
        r.requester_name.toLowerCase().includes(q) ||
        (r.requester_company ?? '').toLowerCase().includes(q) ||
        r.equipment_category.toLowerCase().includes(q) ||
        r.site_region.toLowerCase().includes(q)
    }
    return true
  })

  const counts = Object.fromEntries(
    Object.keys(S).map(s => [s, rfqs.filter(r => r.status === s).length])
  )

  const toggleVendor = (id: string) => {
    setDispatchIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id])
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-extrabold text-navy-900">RFQ Lead Tracker</h1>
          <p className="text-slate-500 text-sm mt-0.5">{rfqs.length} total · {counts.new ?? 0} new · {counts.dispatched ?? 0} dispatched</p>
        </div>
        <button onClick={load} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <button onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${!statusFilter ? 'bg-navy-900 text-white border-navy-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
          All ({rfqs.length})
        </button>
        {Object.entries(S).map(([k, v]) => (
          <button key={k} onClick={() => setStatusFilter(k === statusFilter ? '' : k)}
            className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${statusFilter === k ? `${v.bg} ${v.color} border-current` : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
            {v.label} {counts[k] > 0 && `(${counts[k]})`}
          </button>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-5 min-h-0">
        {/* LEFT: RFQ list */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="Search RFQs…"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No RFQs match</p>
            </div>
          ) : (
            <div className="overflow-y-auto space-y-0 border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
              {filtered.map(rfq => {
                const sc = S[rfq.status] ?? S.new
                const isActive = selected?.id === rfq.id
                return (
                  <button key={rfq.id} onClick={() => selectRFQ(rfq)}
                    className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-slate-50 ${isActive ? 'bg-orange-50 border-l-4 border-orange-500' : ''}`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-orange-600">{rfq.rfq_number}</span>
                      <div className="flex items-center gap-1.5">
                        {rfq.urgency === 'urgent' && <span className="text-xs font-bold text-red-600">URGENT</span>}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.color}`}>{sc.label}</span>
                      </div>
                    </div>
                    <div className="font-semibold text-navy-900 text-sm mb-0.5">{rfq.equipment_category}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>{rfq.requester_name}{rfq.requester_company ? ` · ${rfq.requester_company}` : ''}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {rfq.site_region}
                      {rfq.required_capacity && <span>· {rfq.required_capacity}{rfq.capacity_unit ? ' ' + rfq.capacity_unit : ''}</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(rfq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Detail + Dispatch panel */}
        <div className="lg:col-span-3 overflow-y-auto">
          {selected ? (
            <div className="space-y-4">
              {/* RFQ Summary */}
              <div className="bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-sm font-bold text-orange-600">{selected.rfq_number}</span>
                    <span className={`ml-3 text-xs font-semibold px-2 py-0.5 rounded-full border ${(S[selected.status] ?? S.new).bg} ${(S[selected.status] ?? S.new).color}`}>
                      {(S[selected.status] ?? S.new).label}
                    </span>
                  </div>
                  <select
                    defaultValue={selected.status}
                    onChange={e => updateStatus(selected.id, e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                    {Object.entries(S).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-0.5">Requester</span><span className="font-semibold text-navy-900">{selected.requester_name}</span></div>
                  <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-0.5">Company</span><span className="font-semibold text-navy-900">{selected.requester_company ?? '—'}</span></div>
                  <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-0.5">Email</span><a href={`mailto:${selected.requester_email}`} className="text-orange-600 hover:underline text-sm">{selected.requester_email}</a></div>
                  <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-0.5">Phone</span><span className="font-semibold text-navy-900">{selected.requester_phone ?? '—'}</span></div>
                  <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-0.5">Equipment</span><span className="font-semibold text-navy-900">{selected.equipment_category}</span></div>
                  <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-0.5">Capacity</span><span className="font-semibold text-navy-900">{selected.required_capacity ? `${selected.required_capacity} ${selected.capacity_unit ?? ''}` : '—'}</span></div>
                  <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-0.5">Site Region</span><span className="font-semibold text-navy-900">{selected.site_region}</span></div>
                  <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-0.5">Urgency</span><span className={`font-bold ${selected.urgency === 'urgent' ? 'text-red-600' : selected.urgency === 'high' ? 'text-orange-600' : 'text-slate-700'}`}>{selected.urgency.charAt(0).toUpperCase() + selected.urgency.slice(1)}</span></div>
                  {selected.duty_class && <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-0.5">Duty Class</span><span className="font-semibold text-navy-900">{selected.duty_class}</span></div>}
                  {selected.rental_duration && <div><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-0.5">Duration</span><span className="font-semibold text-navy-900">{selected.rental_duration}</span></div>}
                  {selected.budget_range && <div className="col-span-2"><span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-0.5">Budget</span><span className="font-semibold text-navy-900">{selected.budget_range}</span></div>}
                  {selected.project_description && (
                    <div className="col-span-2">
                      <span className="text-slate-400 text-xs uppercase tracking-wider font-bold block mb-1">Project Description</span>
                      <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2.5 leading-relaxed">{selected.project_description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vendor Dispatch */}
              <div className="bg-white border border-slate-200 rounded-xl">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-500" /> Dispatch to Vendors (BCC)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Vendor emails are BCC'd — requester cannot see them.
                    {selected.matched_vendor_ids?.length > 0 && ` ${selected.matched_vendor_ids.length} auto-matched.`}
                  </p>
                </div>
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {vendors.map(v => {
                    const isDispatched = selected.dispatched_to?.includes(v.id)
                    const isSelected = dispatchIds.includes(v.id)
                    const isMatched = selected.matched_vendor_ids?.includes(v.id)
                    return (
                      <label key={v.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-orange-300 bg-orange-50' : 'border-slate-100 hover:border-slate-200 bg-slate-50'} ${isDispatched ? 'opacity-60' : ''}`}>
                        <input type="checkbox" checked={isSelected} onChange={() => !isDispatched && toggleVendor(v.id)}
                          disabled={isDispatched} className="accent-orange-500 w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-navy-900 text-sm">{v.company_name}</span>
                            {v.verified && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                            {isMatched && <span className="text-xs text-blue-600 font-bold">Auto-matched</span>}
                            {isDispatched && <span className="text-xs text-green-600 font-bold">Already sent</span>}
                          </div>
                          <div className="text-xs text-slate-500">{v.city}, {v.country} · {v.email} · {v.rfq_count} RFQs</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {v.equipment_categories?.slice(0,3).map(c => (
                              <span key={c} className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{c}</span>
                            ))}
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${v.tier === 'featured' ? 'bg-orange-100 text-orange-700' : v.tier === 'standard' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                          {v.tier}
                        </span>
                      </label>
                    )
                  })}
                </div>
                <div className="px-4 pb-4 space-y-3">
                  <textarea value={dispatchMsg} onChange={e => setDispatchMsg(e.target.value)} rows={2}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Optional message to include with dispatch (not shown to requester)…" />
                  <button onClick={dispatch} disabled={dispatching || dispatchIds.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors">
                    {dispatching ? <><RefreshCw className="w-4 h-4 animate-spin" /> Dispatching…</> : <><Send className="w-4 h-4" /> Dispatch to {dispatchIds.length} Vendor{dispatchIds.length !== 1 ? 's' : ''}</>}
                  </button>
                </div>
              </div>

              {/* Commission + Notes */}
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-bold text-navy-900 text-sm mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-500" /> Commission Tracker &amp; Notes
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Expected Commission ({selected.commission_currency})</label>
                    <input type="number" value={commission} onChange={e => setCommission(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 35000" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Actual Deal Value (marks received)</label>
                    <input type="number" value={dealValue} onChange={e => setDealValue(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter to mark commission received" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">Admin Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    placeholder="Internal notes — not visible to requester or vendors…" />
                </div>
                <button onClick={saveUpdates} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save Updates
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
              <Inbox className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-slate-400 font-medium">Select an RFQ to manage</h3>
              <p className="text-slate-300 text-sm mt-1">Click any lead on the left to view details and dispatch to vendors</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
