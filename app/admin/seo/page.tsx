'use client'

import { useState } from 'react'
import { Search, TrendingUp, Globe, FileText, ExternalLink, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

const SEO_ARTICLES = [
  { title: 'International Lifting Standards: ASME B30 vs ISO vs FEM', keyword: 'crane safety standards ASME B30', score: 92, h1: true, schema: 'TechArticle', altText: true, status: 'live', views: 340 },
  { title: 'Total Cost of Ownership in EOT Cranes', keyword: 'EOT crane maintenance cost TCO', score: 91, h1: true, schema: 'TechArticle', altText: true, status: 'live', views: 287 },
  { title: 'The State of Heavy Lifting 2026: India and West Africa', keyword: 'India infrastructure growth 2026 lifting', score: 88, h1: true, schema: 'TechArticle', altText: true, status: 'live', views: 215 },
  { title: 'Wire Rope Rejection Criteria: A Field Guide for Riggers', keyword: 'wire rope inspection rejection criteria', score: 85, h1: true, schema: 'TechArticle', altText: false, status: 'live', views: 178 },
  { title: 'Crane Duty Classification: FEM 1.001 vs ASME B30', keyword: 'FEM crane classification duty cycle', score: 87, h1: true, schema: 'TechArticle', altText: true, status: 'live', views: 162 },
  { title: 'NCCCO vs CPCS vs LEEA vs OPITO: Certification Compared', keyword: 'NCCCO CPCS LEEA crane certification', score: 89, h1: true, schema: 'TechArticle', altText: true, status: 'live', views: 203 },
  { title: 'Crawler Crane Selection Guide for Project Sites', keyword: 'crawler crane selection guide India', score: 0, h1: false, schema: null, altText: false, status: 'draft', views: 0 },
  { title: 'Port Cranes West Africa: Equipment & Operators Guide', keyword: 'port cranes West Africa operators', score: 0, h1: false, schema: null, altText: false, status: 'planned', views: 0 },
]

const PROGRAMMATIC_URLS = [
  { url: '/knowledge-base/standards/asme-b30/', status: 'indexed', priority: 'high' },
  { url: '/knowledge-base/cranes/eot-cranes/', status: 'indexed', priority: 'high' },
  { url: '/knowledge-base/certification/nccco/', status: 'pending', priority: 'medium' },
  { url: '/directory/rentals/india/mumbai/', status: 'indexed', priority: 'high' },
  { url: '/rentals/crawler-cranes-india', status: 'indexed', priority: 'high' },
  { url: '/rentals/mobile-cranes-uae', status: 'indexed', priority: 'high' },
  { url: '/rentals/tower-cranes-gcc', status: 'pending', priority: 'medium' },
  { url: '/rentals/eot-cranes-india', status: 'indexed', priority: 'high' },
  { url: '/rentals/equipment-nigeria', status: 'pending', priority: 'medium' },
  { url: '/rentals/equipment-west-africa', status: 'not-indexed', priority: 'low' },
  { url: '/directory/vendors/india/eot-cranes/', status: 'pending', priority: 'medium' },
  { url: '/directory/vendors/uae/mobile-cranes/', status: 'pending', priority: 'medium' },
]

const KEYWORDS = [
  { keyword: 'crane safety standards ASME B30', vol: '1,200', pos: 'P1', trend: '↑' },
  { keyword: 'EOT crane TCO maintenance cost', vol: '480', pos: 'P2', trend: '↑' },
  { keyword: 'FEM crane classification', vol: '860', pos: 'P1', trend: '→' },
  { keyword: 'NCCCO LEEA certification guide', vol: '640', pos: 'P2', trend: '↑' },
  { keyword: 'India infrastructure crane demand 2026', vol: '320', pos: 'P3', trend: '↑' },
  { keyword: 'crawler crane rental India', vol: '1,900', pos: 'P8', trend: '↑' },
  { keyword: 'mobile crane rental UAE Dubai', vol: '2,400', pos: 'P12', trend: '↑' },
  { keyword: 'lifting equipment supplier West Africa', vol: '280', pos: 'P4', trend: '↑' },
  { keyword: 'wire rope inspection rejection criteria', vol: '540', pos: 'P1', trend: '→' },
  { keyword: 'EOT crane vendor India', vol: '1,600', pos: 'P18', trend: '↑' },
]

const STATUS_ICON = {
  indexed: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
  pending: <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />,
  'not-indexed': <XCircle className="w-3.5 h-3.5 text-red-400" />,
}

export default function AdminSEOPage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'urls' | 'keywords' | 'schema'>('audit')

  const avgScore = Math.round(SEO_ARTICLES.filter(a => a.score > 0).reduce((s, a) => s + a.score, 0) / SEO_ARTICLES.filter(a => a.score > 0).length)
  const liveCount = SEO_ARTICLES.filter(a => a.status === 'live').length
  const indexedCount = PROGRAMMATIC_URLS.filter(u => u.status === 'indexed').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-navy-900">SEO Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Monitor content performance, indexing, and programmatic SEO</p>
        </div>
        <a
          href="https://search.google.com/search-console"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 hover:border-slate-300 transition-colors"
        >
          <Globe className="w-4 h-4" /> Google Search Console <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Published Articles', value: liveCount, sub: 'Live on site', color: 'text-green-500 bg-green-50' },
          { label: 'Avg SEO Score', value: `${avgScore}/100`, sub: 'Target: 85+', color: 'text-orange-500 bg-orange-50' },
          { label: 'Indexed URLs', value: indexedCount, sub: `of ${PROGRAMMATIC_URLS.length} programmatic`, color: 'text-blue-500 bg-blue-50' },
          { label: 'Target Keywords', value: KEYWORDS.length, sub: `${KEYWORDS.filter(k => ['P1', 'P2', 'P3'].includes(k.pos)).length} in top 3`, color: 'text-purple-500 bg-purple-50' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`text-2xl font-extrabold mb-1 ${kpi.color.split(' ')[0]}`}>{kpi.value}</div>
            <div className="text-xs font-semibold text-navy-900">{kpi.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {[
          { id: 'audit', label: 'Content Audit' },
          { id: 'urls', label: 'Programmatic URLs' },
          { id: 'keywords', label: 'Keyword Rankings' },
          { id: 'schema', label: 'Schema Markup' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Audit Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-navy-900 text-sm">Article SEO Audit</h3>
            <Link href="/admin/content" className="text-xs text-orange-500 hover:text-orange-600 font-semibold">
              Manage Content →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="w-80">Article Title</th>
                  <th>Primary Keyword</th>
                  <th>SEO Score</th>
                  <th>H1</th>
                  <th>Schema</th>
                  <th>Alt Text</th>
                  <th>Status</th>
                  <th>Views</th>
                </tr>
              </thead>
              <tbody>
                {SEO_ARTICLES.map((a, i) => (
                  <tr key={i}>
                    <td className="max-w-xs">
                      <span className="text-xs font-medium text-slate-700 line-clamp-1">{a.title}</span>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-slate-500 text-[11px]">{a.keyword}</span>
                    </td>
                    <td>
                      {a.score > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${a.score >= 90 ? 'bg-green-500' : a.score >= 80 ? 'bg-orange-400' : 'bg-red-400'}`}
                              style={{ width: `${a.score}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${a.score >= 90 ? 'text-green-600' : a.score >= 80 ? 'text-orange-500' : 'text-red-500'}`}>
                            {a.score}
                          </span>
                        </div>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td>{a.h1 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                    <td>
                      {a.schema ? (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-mono">{a.schema}</span>
                      ) : <XCircle className="w-4 h-4 text-red-400" />}
                    </td>
                    <td>{a.altText ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-400" />}</td>
                    <td>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        a.status === 'live' ? 'bg-green-50 text-green-700 border-green-200'
                        : a.status === 'draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="text-sm font-semibold text-navy-900">{a.views > 0 ? a.views.toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Programmatic URLs Tab */}
      {activeTab === 'urls' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-bold text-navy-900 text-sm">Programmatic SEO — URL Silo Structure</h3>
            <p className="text-xs text-slate-500 mt-1">Target URL architecture for search authority. Submit to Google Search Console to accelerate indexing.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="w-64">URL Path</th>
                  <th>Index Status</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {PROGRAMMATIC_URLS.map((url, i) => (
                  <tr key={i}>
                    <td>
                      <code className="text-xs font-mono text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                        hoistmarket.com{url.url}
                      </code>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {STATUS_ICON[url.status as keyof typeof STATUS_ICON]}
                        <span className={`text-xs font-semibold capitalize ${
                          url.status === 'indexed' ? 'text-green-600'
                          : url.status === 'pending' ? 'text-yellow-600'
                          : 'text-red-500'
                        }`}>{url.status}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        url.priority === 'high' ? 'text-red-600' : url.priority === 'medium' ? 'text-orange-500' : 'text-slate-400'
                      }`}>{url.priority}</span>
                    </td>
                    <td>
                      <a
                        href={`https://search.google.com/search-console/inspect?resource_id=https://hoistmarket.com${url.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="font-bold text-navy-900 text-sm">Target Keyword Rankings</h3>
            <p className="text-xs text-slate-500 mt-1">Estimated positions based on content targeting. Sync with Google Search Console for live data.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th>Est. Volume/mo</th>
                  <th>Position</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {KEYWORDS.map((kw, i) => (
                  <tr key={i}>
                    <td className="font-medium text-slate-700 text-sm">{kw.keyword}</td>
                    <td className="font-mono text-sm font-semibold text-slate-600">{kw.vol}</td>
                    <td>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                        kw.pos === 'P1' ? 'bg-green-50 text-green-700 border-green-200'
                        : kw.pos === 'P2' || kw.pos === 'P3' ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : kw.pos === 'P4' || kw.pos === 'P8' ? 'bg-orange-50 text-orange-700 border-orange-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>{kw.pos}</span>
                    </td>
                    <td className={`text-lg font-bold ${kw.trend === '↑' ? 'text-green-500' : kw.trend === '↓' ? 'text-red-500' : 'text-slate-400'}`}>
                      {kw.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schema Tab */}
      {activeTab === 'schema' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="font-bold text-navy-900 text-sm">Schema Markup Coverage</h3>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { type: 'WebSite', location: 'app/layout.tsx', status: 'Active', desc: 'Site-wide schema with SearchAction potentialAction' },
                  { type: 'TechnicalArticle', location: 'knowledge-base/[slug]', status: 'Active', desc: 'On all published knowledge base articles with keywords, author, datePublished' },
                  { type: 'LocalBusiness', location: 'directory/[slug]', status: 'Active', desc: 'On all vendor profile pages with address, email, telephone' },
                  { type: 'Service', location: 'rentals/[slug]', status: 'Active', desc: 'On all programmatic rental market pages with areaServed, serviceType' },
                  { type: 'FAQPage', location: 'knowledge-base/faq', status: 'Pending', desc: 'FAQ schema for common questions — add to FAQ article page' },
                  { type: 'Product', location: 'equipment/[id]', status: 'Pending', desc: 'Product schema for equipment spec pages with capacity, specifications' },
                  { type: 'BreadcrumbList', location: 'All deep pages', status: 'Pending', desc: 'Add BreadcrumbList schema to complement visual breadcrumbs' },
                  { type: 'Organization', location: 'about page', status: 'Planned', desc: 'Organization schema with contactPoint, address, sameAs (LinkedIn)' },
                ].map(s => (
                  <div key={s.type} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      s.status === 'Active' ? 'bg-green-500' : s.status === 'Pending' ? 'bg-yellow-400' : 'bg-slate-300'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs font-mono font-bold text-orange-600">{s.type}</code>
                        <span className={`text-xs font-semibold ${
                          s.status === 'Active' ? 'text-green-600' : s.status === 'Pending' ? 'text-yellow-600' : 'text-slate-400'
                        }`}>{s.status}</span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mb-1">{s.location}</div>
                      <div className="text-xs text-slate-600 leading-relaxed">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PageSpeed Note */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-orange-900 text-sm mb-2">PageSpeed & Core Web Vitals Target: 95+</h4>
                <ul className="text-xs text-orange-700 space-y-1.5 leading-relaxed">
                  <li>• <strong>Images:</strong> Use <code className="bg-orange-100 px-1 rounded">next/image</code> with <code className="bg-orange-100 px-1 rounded">priority</code> on above-the-fold images</li>
                  <li>• <strong>Fonts:</strong> Inter + JetBrains Mono loaded via <code className="bg-orange-100 px-1 rounded">next/font/google</code> with <code className="bg-orange-100 px-1 rounded">display: swap</code></li>
                  <li>• <strong>Code Splitting:</strong> All admin, dashboard, and heavy components are client-side only (<code className="bg-orange-100 px-1 rounded">'use client'</code>)</li>
                  <li>• <strong>Static Generation:</strong> All public pages use <code className="bg-orange-100 px-1 rounded">revalidate</code> for ISR — no SSR latency</li>
                  <li>• <strong>CSS:</strong> Tailwind purges unused styles at build — minimal CSS payload</li>
                  <li>• <strong>Supabase:</strong> Edge Functions for geographically distributed API responses</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
