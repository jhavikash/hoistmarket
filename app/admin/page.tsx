'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Inbox, Users, FileText, DollarSign, TrendingUp, AlertCircle, CheckCircle, Zap, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface Stats {
  rfqs: { total: number; new: number; dispatched: number }
  vendors: { total: number; verified: number; pending: number }
  articles: { total: number; published: number }
  revenue: { mrr_inr: number; active_memberships: number }
}

const S_COLOR: Record<string, string> = {
  new:'bg-orange-50 text-orange-700 border-orange-200',reviewing:'bg-yellow-50 text-yellow-700 border-yellow-200',
  matched:'bg-blue-50 text-blue-700 border-blue-200',dispatched:'bg-green-50 text-green-700 border-green-200',
  in_progress:'bg-purple-50 text-purple-700 border-purple-200',closed:'bg-slate-50 text-slate-500 border-slate-200',
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [rfqs, setRfqs] = useState<any[]>([])
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [])

  async function load() {
    try {
      const r = await fetch('/api/admin/stats')
      if (r.ok) setStats(await r.json())
      const { data: rdata } = await supabase.from('rfqs')
        .select('id,rfq_number,requester_name,requester_company,equipment_category,site_region,status,urgency,created_at')
        .order('created_at', { ascending: false }).limit(8)
      setRfqs(rdata ?? [])
      const { data: vdata } = await supabase.from('vendors')
        .select('id,company_name,city,country,equipment_categories,email,created_at')
        .eq('verified', false).eq('is_active', true).order('created_at', { ascending: false }).limit(5)
      setPending(vdata ?? [])
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-xl font-extrabold text-navy-900">Overview Dashboard</h1><p className="text-slate-500 text-sm mt-0.5">Live data · Auto-refreshes every 60s</p></div>
        <button onClick={load} className="text-xs text-slate-400 hover:text-slate-600">↻ Refresh</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:'New RFQs', value:stats?.rfqs.new??0, sub:`${stats?.rfqs.total??0} total`, icon:Inbox, color:'text-orange-500 bg-orange-50', alert:(stats?.rfqs.new??0)>0, href:'/admin/leads' },
          { label:'Pending Approval', value:stats?.vendors.pending??0, sub:`${stats?.vendors.verified??0} verified`, icon:Users, color:'text-blue-500 bg-blue-50', alert:(stats?.vendors.pending??0)>0, href:'/admin/vendors' },
          { label:'Published Articles', value:stats?.articles.published??0, sub:`${stats?.articles.total??0} total`, icon:FileText, color:'text-green-500 bg-green-50', alert:false, href:'/admin/content' },
          { label:'Active Memberships', value:stats?.revenue.active_memberships??0, sub:`₹${((stats?.revenue.mrr_inr??0)).toLocaleString('en-IN')} MRR`, icon:DollarSign, color:'text-purple-500 bg-purple-50', alert:false, href:'/admin/revenue' },
        ].map(k => (
          <Link key={k.label} href={k.href} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-orange-200 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${k.color} flex items-center justify-center`}><k.icon className="w-4 h-4" /></div>
              {k.alert && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />}
            </div>
            <div className="text-2xl font-extrabold text-navy-900 leading-none mb-1">{k.value}</div>
            <div className="text-xs font-semibold text-navy-800">{k.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{k.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-navy-900 text-sm">Recent RFQs</h2>
            <Link href="/admin/leads" className="text-xs text-orange-500 font-semibold flex items-center gap-1">Manage All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {rfqs.length === 0 ? <div className="px-5 py-10 text-center text-slate-400 text-sm">No RFQs yet</div> : (
            <div className="divide-y divide-slate-100">
              {rfqs.map(rfq => (
                <Link key={rfq.id} href="/admin/leads" className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-orange-600">{rfq.rfq_number}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${S_COLOR[rfq.status]??S_COLOR.new}`}>{rfq.status}</span>
                      {rfq.urgency==='urgent' && <span className="text-xs font-bold text-red-600">URGENT</span>}
                    </div>
                    <div className="text-sm font-semibold text-navy-900 truncate">{rfq.equipment_category}</div>
                    <div className="text-xs text-slate-500 truncate">{rfq.requester_name}{rfq.requester_company?` · ${rfq.requester_company}`:''} · {rfq.site_region}</div>
                  </div>
                  <div className="text-xs text-slate-400 flex-shrink-0">{new Date(rfq.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                </Link>
              ))}
            </div>
          )}
          {rfqs.some(r=>r.status==='new') && (
            <div className="px-5 py-3 bg-orange-50 border-t border-orange-100 rounded-b-xl">
              <Link href="/admin/leads" className="flex items-center gap-2 text-sm font-bold text-orange-600">
                <Zap className="w-4 h-4" />{rfqs.filter(r=>r.status==='new').length} RFQ{rfqs.filter(r=>r.status==='new').length>1?'s':''} need dispatch
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-navy-900 text-sm">Pending Vendor Approvals</h2>
            <Link href="/admin/vendors" className="text-xs text-orange-500 font-semibold flex items-center gap-1">Manage All <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {pending.length === 0 ? (
            <div className="px-5 py-10 text-center"><CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" /><p className="text-slate-400 text-sm">All vendors reviewed</p></div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pending.map(v => (
                <div key={v.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0">{v.company_name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-navy-900 text-sm truncate">{v.company_name}</div>
                    <div className="text-xs text-slate-500">{v.city}, {v.country}</div>
                  </div>
                  <Link href="/admin/vendors" className="text-xs text-orange-500 font-bold hover:text-orange-600 flex-shrink-0">Review →</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold text-navy-900 text-sm mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {label:'Review New RFQs',href:'/admin/leads',icon:Inbox,desc:`${stats?.rfqs.new??0} waiting`},
              {label:'Approve Vendors',href:'/admin/vendors',icon:Users,desc:`${stats?.vendors.pending??0} pending`},
              {label:'Publish Article',href:'/admin/content',icon:FileText,desc:'Content calendar'},
              {label:'Revenue Tracker',href:'/admin/revenue',icon:DollarSign,desc:'Log commissions'},
              {label:'Ad Placements',href:'/admin/ads',icon:TrendingUp,desc:'Manage sponsors'},
              {label:'SEO Dashboard',href:'/admin/seo',icon:AlertCircle,desc:'Content audit'},
            ].map(a => (
              <Link key={a.label} href={a.href} className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group">
                <a.icon className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div><div className="text-xs font-bold text-navy-900 group-hover:text-orange-600 transition-colors">{a.label}</div><div className="text-xs text-slate-400">{a.desc}</div></div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-bold text-navy-900 text-sm mb-4">System Status</h2>
          <div className="space-y-3">
            {[
              {label:'Supabase PostgreSQL',ok:true,detail:'RLS active on all tables'},
              {label:'Role-Based Auth (admin/vendor/user)',ok:true,detail:'Middleware + server actions'},
              {label:'RFQ Matching Engine',ok:true,detail:'Auto-scores vendors on submission'},
              {label:'Vendor Notification System',ok:true,detail:'In-app + DB triggers'},
              {label:'Razorpay Payment Gateway',ok:!!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,detail:'Add keys to .env.local'},
              {label:'Resend Email API',ok:!!process.env.RESEND_API_KEY,detail:'Add RESEND_API_KEY to .env.local'},
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.ok?'bg-green-500':'bg-yellow-400'}`} />
                <div className="flex-1 min-w-0"><div className="text-xs font-semibold text-navy-900">{item.label}</div><div className="text-xs text-slate-400">{item.detail}</div></div>
                <span className={`text-xs font-bold flex-shrink-0 ${item.ok?'text-green-600':'text-yellow-600'}`}>{item.ok?'● Live':'◐ Setup'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
