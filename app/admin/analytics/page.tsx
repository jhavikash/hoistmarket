'use client'

import { useState } from 'react'
import {
  TrendingUp, Eye, Users, FileText, Globe, BarChart2,
  ArrowUpRight, ArrowDownRight, ExternalLink, Search
} from 'lucide-react'

// Static analytics data (in production, sync with Google Search Console API)
const TRAFFIC_DATA = [
  { month: 'Nov', sessions: 120, pageviews: 340, rfqs: 2 },
  { month: 'Dec', sessions: 210, pageviews: 590, rfqs: 4 },
  { month: 'Jan', sessions: 380, pageviews: 980, rfqs: 7 },
  { month: 'Feb', sessions: 640, pageviews: 1720, rfqs: 11 },
  { month: 'Mar', sessions: 1140, pageviews: 3060, rfqs: 18 },
]

const TOP_PAGES = [
  { page: '/knowledge-base/asme-b30-vs-iso-vs-fem-lifting-standards', views: 340, avgTime: '5:12', bounce: '38%' },
  { page: '/knowledge-base/eot-crane-total-cost-ownership-tco-guide', views: 287, avgTime: '6:44', bounce: '29%' },
  { page: '/', views: 856, avgTime: '2:08', bounce: '62%' },
  { page: '/directory', views: 420, avgTime: '3:22', bounce: '45%' },
  { page: '/knowledge-base/india-west-africa-lifting-market-2026', views: 215, avgTime: '4:55', bounce: '34%' },
  { page: '/equipment', views: 198, avgTime: '3:45', bounce: '51%' },
  { page: '/knowledge-base/nccco-cpcs-leea-certification-guide', views: 203, avgTime: '5:30', bounce: '33%' },
  { page: '/rentals/crawler-cranes-india', views: 167, avgTime: '2:58', bounce: '48%' },
]

const TOP_COUNTRIES = [
  { country: 'India', flag: '🇮🇳', sessions: 510, pct: 45 },
  { country: 'United Arab Emirates', flag: '🇦🇪', sessions: 228, pct: 20 },
  { country: 'Saudi Arabia', flag: '🇸🇦', sessions: 114, pct: 10 },
  { country: 'Nigeria', flag: '🇳🇬', sessions: 91, pct: 8 },
  { country: 'United Kingdom', flag: '🇬🇧', sessions: 57, pct: 5 },
  { country: 'Qatar', flag: '🇶🇦', sessions: 34, pct: 3 },
  { country: 'Ghana', flag: '🇬🇭', sessions: 23, pct: 2 },
  { country: 'Other', flag: '🌍', sessions: 83, pct: 7 },
]

const TOP_KEYWORDS = [
  { keyword: 'crane safety standards ASME B30', clicks: 82, impressions: 1240, ctr: '6.6%', pos: 1.2 },
  { keyword: 'FEM crane classification', clicks: 64, impressions: 890, ctr: '7.2%', pos: 1.4 },
  { keyword: 'EOT crane TCO maintenance cost', clicks: 48, impressions: 620, ctr: '7.7%', pos: 2.1 },
  { keyword: 'NCCCO LEEA crane certification guide', clicks: 41, impressions: 580, ctr: '7.1%', pos: 2.3 },
  { keyword: 'wire rope inspection rejection criteria', clicks: 38, impressions: 520, ctr: '7.3%', pos: 1.8 },
  { keyword: 'crawler crane rental India', clicks: 29, impressions: 1900, ctr: '1.5%', pos: 8.2 },
  { keyword: 'mobile crane rental UAE Dubai', clicks: 22, impressions: 2400, ctr: '0.9%', pos: 12.1 },
  { keyword: 'India infrastructure crane demand 2026', clicks: 31, impressions: 390, ctr: '7.9%', pos: 3.1 },
]

const REFERRERS = [
  { source: 'Google Organic', sessions: 680, pct: 60 },
  { source: 'Direct', sessions: 228, pct: 20 },
  { source: 'LinkedIn', sessions: 91, pct: 8 },
  { source: 'Other Social', sessions: 34, pct: 3 },
  { source: 'Referral', sessions: 57, pct: 5 },
  { source: 'Email / Newsletter', sessions: 50, pct: 4 },
]

const maxSessions = Math.max(...TRAFFIC_DATA.map(d => d.sessions))

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<'30d' | '90d' | 'all'>('30d')

  const currentMonth = TRAFFIC_DATA[TRAFFIC_DATA.length - 1]
  const prevMonth = TRAFFIC_DATA[TRAFFIC_DATA.length - 2]
  const sessionGrowth = (((currentMonth.sessions - prevMonth.sessions) / prevMonth.sessions) * 100).toFixed(0)
  const pvGrowth = (((currentMonth.pageviews - prevMonth.pageviews) / prevMonth.pageviews) * 100).toFixed(0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-navy-900">Analytics & Traffic</h1>
          <p className="text-slate-500 text-sm mt-0.5">Site traffic, keyword rankings, and audience insights</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-1">
            {(['30d', '90d', 'all'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${period === p ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {p === '30d' ? 'Last 30d' : p === '90d' ? 'Last 90d' : 'All Time'}
              </button>
            ))}
          </div>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:border-slate-300 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" /> GA4 <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Sessions (Mar)', value: currentMonth.sessions.toLocaleString(), change: `+${sessionGrowth}%`, up: true, icon: Users },
          { label: 'Page Views (Mar)', value: currentMonth.pageviews.toLocaleString(), change: `+${pvGrowth}%`, up: true, icon: Eye },
          { label: 'RFQs (Mar)', value: currentMonth.rfqs, change: '+64%', up: true, icon: FileText },
          { label: 'Organic %', value: '60%', change: '+8% vs Jan', up: true, icon: Search },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <k.icon className="w-4 h-4 text-slate-400" />
              <span className={`text-xs font-bold flex items-center gap-0.5 ${k.up ? 'text-green-600' : 'text-red-500'}`}>
                {k.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {k.change}
              </span>
            </div>
            <div className="text-2xl font-extrabold text-navy-900 leading-none mb-1">{k.value}</div>
            <div className="text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Traffic Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-navy-900 text-sm">Monthly Traffic Growth</h3>
            <span className="text-xs text-slate-400">Sessions & Pageviews</span>
          </div>
          <div className="flex items-end justify-between gap-3 h-40">
            {TRAFFIC_DATA.map(d => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end gap-1 justify-center" style={{ height: '120px' }}>
                  <div
                    className="w-5 bg-orange-500/20 rounded-t hover:bg-orange-500/40 transition-colors"
                    style={{ height: `${(d.sessions / maxSessions) * 100}%` }}
                    title={`Sessions: ${d.sessions}`}
                  />
                  <div
                    className="w-5 bg-navy-900/20 rounded-t hover:bg-navy-900/40 transition-colors"
                    style={{ height: `${(d.pageviews / (maxSessions * 3)) * 100}%` }}
                    title={`Pageviews: ${d.pageviews}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium">{d.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-3 bg-orange-500/30 rounded" /> Sessions</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500"><div className="w-3 h-3 bg-navy-900/20 rounded" /> Pageviews</div>
          </div>
        </div>

        {/* Traffic by Country */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-bold text-navy-900 text-sm mb-4">Traffic by Country</h3>
          <div className="space-y-3">
            {TOP_COUNTRIES.map(c => (
              <div key={c.country} className="flex items-center gap-3">
                <span className="text-lg flex-shrink-0">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700 truncate">{c.country}</span>
                    <span className="text-xs text-slate-500 ml-2 flex-shrink-0">{c.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0 w-8 text-right">{c.sessions}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Top Pages */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-navy-900 text-sm">Top Pages</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Page</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Views</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Avg Time</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Bounce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TOP_PAGES.map(p => (
                  <tr key={p.page} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 max-w-[180px]">
                      <span className="text-xs font-mono text-orange-600 truncate block" title={p.page}>
                        {p.page.replace('https://hoistmarket.com', '')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-navy-900">{p.views}</td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">{p.avgTime}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-semibold ${parseInt(p.bounce) < 40 ? 'text-green-600' : parseInt(p.bounce) < 55 ? 'text-orange-500' : 'text-slate-400'}`}>
                        {p.bounce}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Keyword Rankings from GSC */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-navy-900 text-sm">Search Console Keywords</h3>
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
              Open GSC <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Keyword</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Clicks</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-slate-400">CTR</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Pos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TOP_KEYWORDS.map(k => (
                  <tr key={k.keyword} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="text-xs text-slate-700 line-clamp-1" title={k.keyword}>{k.keyword}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-navy-900">{k.clicks}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-bold ${parseFloat(k.ctr) >= 5 ? 'text-green-600' : parseFloat(k.ctr) >= 2 ? 'text-orange-500' : 'text-slate-400'}`}>
                        {k.ctr}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-extrabold ${k.pos <= 3 ? 'text-green-600' : k.pos <= 10 ? 'text-orange-500' : 'text-slate-400'}`}>
                        #{k.pos.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-navy-900 text-sm">Traffic Sources</h3>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
          {REFERRERS.map(r => (
            <div key={r.source} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-700">{r.source}</span>
                  <span className="text-xs text-slate-500">{r.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${
                    r.source.includes('Google') ? 'bg-blue-500'
                    : r.source.includes('LinkedIn') ? 'bg-blue-700'
                    : r.source.includes('Direct') ? 'bg-orange-500'
                    : r.source.includes('Email') ? 'bg-green-500'
                    : 'bg-slate-400'
                  }`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
              <span className="text-xs font-bold text-slate-600 w-10 text-right">{r.sessions}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
