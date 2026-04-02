'use client'

import { useEffect, useState } from 'react'
import {
  DollarSign, TrendingUp, CreditCard, CheckCircle,
  Clock, Download, RefreshCw, AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

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
  vendors: any
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

export default function AdminRevenuePage() {
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [commissions, setCommissions] = useState<CommissionEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)

    const [{ data: mems }, { data: rfqs }] = await Promise.all([
      (supabase.from('memberships') as any)
        .select('*')
        .order('created_at', { ascending: false }),

      (supabase.from('rfqs') as any)
        .select('*')
        .order('created_at', { ascending: false }),
    ])

    setMemberships(
      ((mems ?? []) as any[]).map((m: any) => ({
        ...m,
        vendors: Array.isArray(m.vendors) ? m.vendors[0] : m.vendors
      }))
    )

    setCommissions(rfqs ?? [])
    setLoading(false)
  }

  const updateCommissionStatus = async (id: string, status: string) => {
    const updates: any = { commission_status: status }

    if (status === 'received') {
      updates.commission_received_at = new Date().toISOString()
    }

    const { error } = await (supabase.from('rfqs') as any)
      .update(updates)
      .eq('id', id)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Updated')
    loadData()
  }

  const updateMembershipStatus = async (id: string, status: string) => {
    const { error } = await (supabase.from('memberships') as any)
      .update({ status })
      .eq('id', id)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Updated')
    loadData()
  }

  const exportCSV = () => {
    const rows = [
      ['Date', 'Source', 'Amount'],
      ...memberships.map(m => [
        m.starts_at,
        m.vendors?.company_name || 'Unknown',
        m.price_inr
      ])
    ]

    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv])
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'revenue.csv'
    a.click()
  }

  return (
    <div>
      <h1>Revenue Dashboard</h1>

      <button onClick={exportCSV}>Export</button>
      <button onClick={loadData}>Refresh</button>

      {loading ? <p>Loading...</p> : (
        <>
          <h2>Memberships</h2>
          {memberships.map(m => (
            <div key={m.id}>
              {m.vendors?.company_name} - ₹{m.price_inr}
            </div>
          ))}

          <h2>Commissions</h2>
          {commissions.map(c => (
            <div key={c.id}>
              {c.rfq_number} - {c.commission_status}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
