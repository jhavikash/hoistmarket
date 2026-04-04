'use client'

import { useEffect, useState } from 'react'
import {
  DollarSign, TrendingUp, CreditCard, CheckCircle,
  Clock, Plus, Download, RefreshCw, AlertCircle
} from 'lucide-react'
import { supabase as _sb } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = _sb as any

interface Membership {
  id: string
  vendor_id: string
  tier: string
  price_inr: number
  price_usd: number
  billing_cycle: string
  status: string
  starts_at: string
  expires_at: string
  razorpay_payment_id: string | null
  vendors: { company_name: string; email: string; city: string; country: string } | null
}

interface CommissionEntry {
  id: string
  rfq_number: string
  requester_name: string
  requester_company: string | null
  equipment_category: string
  commission_status: string
  expected_commission: number | null
  actual_deal_value: number | null
  commission_currency: string
  dispatched_to: string[]
  created_at: string
  commission_received_at: string | null
}

interface ManualEntry {
  date: string
  source: string
  amount: number
  type: 'rfq_commission' | 'directory_fee' | 'sponsored_content' | 'ad_placement' | 'other'
  status: 'received' | 'expected' | 'pending'
  notes: string
}

const TIER_PRICES: Record<string, { inr: number; usd: number }> = {
  standard: { inr: 5000, usd: 60 },
  featured:  { inr: 18000, usd: 216 },
  enterprise: { inr: 60000, usd: 720 },
}

const STATUS_COLOR: Record<string, string> = {
  received: 'bg-green-50 text-green-700 border-green-200',
  expected: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  pending:  'bg-slate-50  text-slate-500  border-slate-200',
  invoiced: 'bg-blue-50   text-blue-700   border-blue-200',
  cancelled:'bg-red-50    text-red-600    border-red-200',
}

export default function AdminRevenuePage() {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [commissions, setCommissions] = useState<CommissionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [manualEntry, setManualEntry] = useState<ManualEntry>({
    date: new Date().toISOString().split('T')[0],
    source: '', amount: 0, type: 'rfq_commission', status: 'received', notes: '',
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const [{ data: mems }, { data: rfqs }] = await Promise.all([
      supabase.from('memberships')
        .select('id,vendor_id,tier,price_inr,price_usd,billing_cycle,status,starts_at,expires_at,razorpay_payment_id,vendors(company_name,email,city,country)')
        .order('created_at', { ascending: false }),
      supabase.from('rfqs')
        .select('id,rfq_number,requester_name,requester_company,equipment_category,commission_status,expected_commission,actual_deal_value,commission_currency,dispatched_to,created_at,commission_received_at')
        .not('dispatched_to', 'eq', '{}')
        .order('created_at', { ascending: false }),
    ])

    const safeMems: Membership[] = (mems ?? []).map((m: any) => ({
      id: m.id,
      vendor_id: m.vendor_id,
      tier: m.tier,
      price_inr: m.price_inr,
      price_usd: m.price_usd,
      billing_cycle: m.billing_cycle,
      status: m.status,
      starts_at: m.starts_at,
      expires_at: m.expires_at,
      razorpay_payment_id: m.razorpay_payment_id ?? null,
      vendors: Array.isArray(m.vendors) ? m.vendors[0] ?? null : m.vendors ?? null,
    }))
    setMemberships(safeMems)
    setCommissions(rfqs ?? [])
    setLoading(false)
  }

  const updateCommissionStatus = async (id: string, status: string) => {
    const updates: any = { commission_status: status }
    if (status === 'received') updates.commission_received_at = new Date().toISOString()
    const { error } = await supabase.from('rfqs').update(updates).eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Commission status updated')
    loadData()
  }

  const updateMembershipStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('memberships').update({ status } as any).eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Membership updated')
    loadData()
  }

  // Aggregated numbers
  const activeMRR = memberships
    .filter(m => m.status === 'active')
    .reduce((s, m) => s + (m.billing_cycle === 'annual' ? m.price_inr / 12 : m.price_inr), 0)

  const commissionsReceived = commissions
    .filter(c => c.commission_status === 'received')
    .reduce((s, c) => s + (c.expected_commission ?? 0), 0)

  const commissionsExpected = commissions
    .filter(c => ['expected', 'invoiced'].includes(c.commission_status))
    .reduce((s, c) => s + (c.expected_commission ?? 0), 0)

  const totalMembershipRevenue = memberships
    .filter(m => m.status === 'active')
    .reduce((s, m) => s + m.price_inr, 0)

  const exportCSV = () => {
    const rows = [
      ['Date', 'Source', 'Type', 'Amount (INR)', 'Status', 'Notes'],
      ...memberships.map(m => [
        new Date(m.starts_at).toLocaleDateString('en-IN'),
        m.vendors?.company_name ?? 'Unknown',
        `${m.tier.charAt(0).toUpperCase()+m.tier.slice(1)} Membership`,
        m.price_inr,
        m.status,
        m.razorpay_payment_id ?? '',
      ]),
      ...commissions.map(c => [
        new Date(c.created_at).toLocaleDateString('en-IN'),
        `${c.rfq_number} — ${c.requester_company ?? c.requester_name}`,
        'RFQ Commission',
        c.expected_commission ?? 0,
        c.commission_status,
        c.equipment_category,
      ]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'hoistmarket-revenue.csv'; a.click()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-navy-900">Revenue Tracker</h1>
          <p className="text-slate-500 text-sm mt-0.5">Memberships, RFQ commissions, and ad revenue</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 hover:text-slate-800 font-semibold text-sm rounded-lg transition-colors hover:bg-slate-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={loadData} className="p-2.5 border border-slate-200 bg-white text-slate-400 hover:text-slate-600 rounded-lg transition-colors hover:bg-slate-50">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Monthly Recurring Revenue', value: `₹${Math.round(activeMRR).toLocaleString('en-IN')}`, sub: `${memberships.filter(m=>m.status==='active').length} active memberships`, icon: TrendingUp, color: 'text-green-500 bg-green-50' },
          { label: 'Total Membership Revenue', value: `₹${totalMembershipRevenue.toLocaleString('en-IN')}`, sub: 'all-time', icon: CreditCard, color: 'text-blue-500 bg-blue-50' },
          { label: 'Commissions Received',  value: `₹${commissionsReceived.toLocaleString('en-IN')}`,  sub: 'RFQ broker fees', icon: CheckCircle, color: 'text-purple-500 bg-purple-50' },
          { label: 'Commissions Expected',  value: `₹${commissionsExpected.toLocaleString('en-IN')}`,  sub: 'in pipeline', icon: Clock, color: 'text-orange-500 bg-orange-50' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${k.color} flex items-center justify-center mb-3`}>
              <k.icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-extrabold text-navy-900 leading-tight mb-0.5">{k.value}</div>
            <div className="text-xs font-semibold text-navy-800">{k.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* 36-Month Roadmap */}
      <div className="bg-white rounded-xl border border-slate-200 mb-5">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-navy-900 text-sm">Revenue Roadmap (Targets)</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { period: 'Month 6', label: 'Platform costs covered', target: '₹38K–75K/mo', progress: 15 },
              { period: 'Month 12', label: 'Break-even', target: '₹1.5L–2.8L/mo', progress: 8 },
              { period: 'Month 24', label: 'Multi-stream maturity', target: '₹9.4L–16.6L/mo', progress: 2 },
              { period: 'Month 36', label: 'Category leadership', target: '₹18.5L–33L/mo', progress: 1 },
            ].map(r => (
              <div key={r.period} className="bg-slate-50 rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{r.period}</div>
                <div className="text-lg font-extrabold text-orange-500 mb-1">{r.target}</div>
                <div className="text-xs text-slate-600 mb-3">{r.label}</div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${r.progress}%` }} />
                </div>
                <div className="text-xs text-slate-400 mt-1">{r.progress}% of target reached</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Memberships */}
      <div className="bg-white rounded-xl border border-slate-200 mb-5">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-navy-900 text-sm">
            Membership Subscriptions ({memberships.length})
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Active: {memberships.filter(m=>m.status==='active').length}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Expired: {memberships.filter(m=>m.status==='expired').length}</span>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400 text-sm">Loading…</div>
        ) : memberships.length === 0 ? (
          <div className="text-center py-10">
            <CreditCard className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No memberships yet</p>
            <p className="text-slate-400 text-xs mt-1">Memberships are created when vendors pay via Razorpay</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Tier</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Cycle</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Expires</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Payment ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberships.map(m => {
                  const isExpiring = m.status === 'active' && new Date(m.expires_at) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-navy-900 text-sm">{m.vendors?.company_name ?? 'Unknown'}</div>
                        <div className="text-xs text-slate-400">{m.vendors?.city}, {m.vendors?.country}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          m.tier === 'featured' ? 'bg-orange-100 text-orange-700' :
                          m.tier === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{m.tier.charAt(0).toUpperCase()+m.tier.slice(1)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-navy-900">₹{m.price_inr.toLocaleString('en-IN')}</div>
                        <div className="text-xs text-slate-400">${m.price_usd}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 capitalize">{m.billing_cycle}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLOR[m.status] ?? STATUS_COLOR.pending}`}>
                            {m.status}
                          </span>
                          {isExpiring && <AlertCircle className="w-3.5 h-3.5 text-yellow-500" title="Expiring within 30 days" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(m.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        {m.razorpay_payment_id ? (
                          <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{m.razorpay_payment_id.slice(0, 16)}…</span>
                        ) : <span className="text-xs text-slate-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={m.status}
                          onChange={e => updateMembershipStatus(m.id, e.target.value)}
                          className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="active">Active</option>
                          <option value="past_due">Past Due</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="expired">Expired</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RFQ Commission Ledger */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-navy-900 text-sm">RFQ Commission Ledger ({commissions.length})</h3>
          <div className="text-xs text-slate-500">3% default commission rate on deal value</div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-slate-400 text-sm">Loading…</div>
        ) : commissions.length === 0 ? (
          <div className="text-center py-10">
            <DollarSign className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No RFQs dispatched yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">RFQ</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Equipment</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Expected Commission</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">{c.rfq_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-navy-900">{c.requester_name}</div>
                      {c.requester_company && <div className="text-xs text-slate-400">{c.requester_company}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{c.equipment_category}</td>
                    <td className="px-4 py-3">
                      {c.expected_commission ? (
                        <div>
                          <div className="font-bold text-navy-900">₹{c.expected_commission.toLocaleString('en-IN')}</div>
                          {c.actual_deal_value && (
                            <div className="text-xs text-slate-400">Deal: ₹{c.actual_deal_value.toLocaleString('en-IN')}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">Not set</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLOR[c.commission_status] ?? STATUS_COLOR.pending}`}>
                        {c.commission_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={c.commission_status}
                        onChange={e => updateCommissionStatus(c.id, e.target.value)}
                        className="text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="expected">Expected</option>
                        <option value="invoiced">Invoiced</option>
                        <option value="received">Received ✓</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
