import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import { 
  ArrowRight, Zap, BookOpen, Users, TrendingUp, Shield, 
  ChevronRight, Star, CheckCircle, BarChart3, Clock, Globe
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'HoistMarket — Global Lifting Equipment & Material Handling Platform',
  description: 'The neutral B2B reference platform for lifting professionals. Technical specs, vendor directory, RFQ tools, ASME B30, FEM standards. India, GCC, West Africa.',
}

const equipmentCategories = [
  { icon: '🏗️', name: 'Overhead Cranes', sub: 'EOT, Gantry, Monorail', href: '/equipment/overhead-cranes' },
  { icon: '⚙️', name: 'Hoists & Winches', sub: 'Chain, Wire Rope, Air', href: '/equipment/hoists' },
  { icon: '🚧', name: 'Mobile Cranes', sub: 'AT, RT, Crawler, Truck', href: '/equipment/mobile-cranes' },
  { icon: '🔗', name: 'Rigging Gear', sub: 'Slings, Shackles, Hooks', href: '/equipment/rigging' },
  { icon: '📦', name: 'Material Handling', sub: 'Conveyors, Stackers', href: '/equipment/material-handling' },
  { icon: '⛽', name: 'Offshore Cranes', sub: 'Pedestal, Knuckle Boom', href: '/equipment/offshore' },
  { icon: '🏙️', name: 'Tower Cranes', sub: 'Hammerhead, Luffing', href: '/equipment/tower-cranes' },
  { icon: '🔬', name: 'Load Testing', sub: 'NDT, Proof, Dynamic', href: '/equipment/load-testing' },
]

const rentalMarkets = [
  { region: 'India — Mumbai', cat: 'Crawler Cranes', href: '/rentals/crawler-cranes-india' },
  { region: 'UAE / Dubai', cat: 'All-Terrain Cranes', href: '/rentals/mobile-cranes-uae' },
  { region: 'Nigeria', cat: 'Mobile Cranes', href: '/rentals/equipment-nigeria' },
  { region: 'India — Gujarat', cat: 'EOT Cranes', href: '/rentals/eot-cranes-india' },
  { region: 'Saudi Arabia', cat: 'Tower Cranes', href: '/rentals/tower-cranes-gcc' },
  { region: 'Ghana / West Africa', cat: 'Material Handling', href: '/rentals/equipment-west-africa' },
]

const newsItems = [
  { tag: 'Regulation', date: 'Mar 24', title: 'OSHA Publishes Revised Cranes & Derricks Rule: What Changes in 2026' },
  { tag: 'Market', date: 'Mar 20', title: 'PM Gati Shakti: Rs 11 Lakh Crore Infrastructure Push Drives Crane Demand Surge' },
  { tag: 'Technology', date: 'Mar 16', title: 'AI Load Path Analysis Cuts LLTR Engineering Time by 40% — ConExpo 2026' },
  { tag: 'Safety', date: 'Mar 11', title: 'LEEA Revises Wire Rope Inspection Intervals for High-Cycle Applications' },
]

async function getFeaturedVendors() {  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('vendors')
    .select('id, company_name, slug, city, country, equipment_categories, tier, verified, featured, description, logo_url')
    .eq('is_active', true)
    .eq('tier', 'featured')
    .limit(3)
  return data || []
}

async function getFeaturedArticles() {  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('articles')
    .select('id, slug, title, excerpt, category, reading_time, is_featured, published_at')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(3)
  return data || []
}

export default async function HomePage() {
  const supabase = await createSupabaseServer()
  const [vendors, articles] = await Promise.all([getFeaturedVendors(), getFeaturedArticles()])

  return (
    <>
      <Navbar />
      <main>
        {/* ── HERO ── */}
        <section className="relative min-h-screen bg-hero-gradient flex items-center overflow-hidden pt-16">
          <div className="absolute inset-0 bg-grid bg-grid-pattern opacity-40" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/5 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />

          <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-3xl">
              <div className="eyebrow-light animate-fade-in-up">
                Lifting Equipment & Material Handling
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[0.95] tracking-tight mb-6 animate-fade-in-up animate-delay-100">
                The Global<br/>
                Reference Platform<br/>
                for <span className="text-orange-500">Lifting Professionals</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl animate-fade-in-up animate-delay-200">
                Technical specs, vendor directory, standards guidance, and equipment rental tools — 
                built for EPC engineers, plant heads, and procurement teams across India, GCC, and West Africa.
              </p>
              <div className="flex flex-wrap gap-4 mb-16 animate-fade-in-up animate-delay-300">
                <Link href="/knowledge-base" className="btn-primary btn-lg group">
                  Explore Knowledge Base
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/directory" className="btn-outline-light btn-lg">
                  Browse Vendors
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-t border-white/8 pt-10 animate-fade-in-up animate-delay-400">
                {[
                  { n: '800+', label: 'Technical References' },
                  { n: '500+', label: 'Verified Vendors' },
                  { n: '3', label: 'Core Markets' },
                  { n: 'Free', label: 'Always & Entirely' },
                ].map((stat, i) => (
                  <div key={i} className={`pr-8 ${i < 3 ? 'border-r border-white/8 mr-8' : ''}`}>
                    <div className="text-4xl font-extrabold text-white mb-1">
                      {stat.n.endsWith('+') ? (
                        <>{stat.n.slice(0, -1)}<span className="text-orange-500">+</span></>
                      ) : stat.n}
                    </div>
                    <div className="text-xs text-slate-500 tracking-wide">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── STANDARDS BAR ── */}
        <div className="bg-black/80 border-y border-white/5 py-3">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8 flex-wrap">
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-slate-600 whitespace-nowrap">Standards</span>
              <div className="flex items-center gap-6 flex-wrap">
                {['ASME B30', 'FEM 1.001', 'EN 13000', 'LOLER 1998', 'DNVGL-ST-0378', 'ISO 4306', 'OSHA 1926.1400'].map(s => (
                  <span key={s} className="text-xs font-semibold text-slate-500">
                    <span className="text-orange-400/80">{s.split(' ')[0]}</span>{' '}{s.split(' ').slice(1).join(' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── VALUE PROPS ── */}
        <section className="py-20 border-b border-slate-100">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="eyebrow">What HoistMarket Is</div>
              <h2 className="section-title">Built for the Industry. Not for the Market.</h2>
              <p className="text-slate-600 mt-3 max-w-xl mx-auto">
                A free, independent reference for lifting and material handling professionals. 
                No products for sale. No vendor bias. No paywalls.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200">
              {[
                {
                  icon: BookOpen,
                  title: 'Reference, Not Retail',
                  body: 'No equipment for sale. No vendor bias. Every page exists to inform — not to sell. Technical data, load charts, and standards guidance presented neutrally.',
                },
                {
                  icon: Shield,
                  title: 'Industry-Built Content',
                  body: 'Written by lifting engineers and EPC professionals. Crane duty classifications, rigging WLL calculations, load chart interpretation — at the depth required for real project decisions.',
                },
                {
                  icon: Zap,
                  title: 'Broker & Directory Engine',
                  body: 'Request equipment quotes through HoistMarket\'s neutral broker system. Vendor contacts stay private until a match is confirmed. Verified directory across India, GCC, and Africa.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white px-10 py-12 group hover:bg-slate-50 transition-colors relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-orange-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom" />
                  <div className="w-12 h-12 bg-navy-900 rounded-lg flex items-center justify-center mb-6">
                    <item.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-navy-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EQUIPMENT HUB ── */}
        <section className="py-20 bg-navy-950">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="eyebrow-light">Equipment Hub</div>
                <h2 className="section-title-light">Browse by Category</h2>
              </div>
              <Link href="/equipment" className="btn-ghost hidden sm:flex">
                All Categories <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-navy-800">
              {equipmentCategories.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="bg-navy-900 hover:bg-navy-800 transition-colors p-6 group relative overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <div className="font-semibold text-white text-sm mb-1 group-hover:text-orange-400 transition-colors">{cat.name}</div>
                  <div className="text-xs text-slate-500">{cat.sub}</div>
                  <ChevronRight className="absolute top-4 right-4 w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
            <div className="mt-4 sm:hidden">
              <Link href="/equipment" className="btn-ghost w-full justify-center">
                All Categories <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── SPONSORED BANNER ── */}
        <section className="py-6 bg-slate-50 border-y border-slate-200">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-xl p-5 flex items-center gap-5 relative overflow-hidden">
              <span className="absolute top-2 right-3 text-[9px] font-bold tracking-[0.2em] uppercase text-white/25">SPONSORED</span>
              <div className="text-3xl flex-shrink-0">🏗️</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-sm mb-1">Konecranes India — Certified Service Partner Network</h4>
                <p className="text-slate-400 text-xs">Planned maintenance, inspections, and genuine spare parts for EOT cranes across India. 48-hour response SLA.</p>
              </div>
              <button className="btn-ghost btn-sm hidden sm:flex flex-shrink-0">Learn More →</button>
            </div>
          </div>
        </section>

        {/* ── KNOWLEDGE BASE ── */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="eyebrow">Knowledge Base</div>
                <h2 className="section-title">Pillar Articles & Technical Guides</h2>
              </div>
              <Link href="/knowledge-base" className="btn-ghost hidden sm:flex">
                Full Library <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <Link key={article.id} href={`/knowledge-base/${article.slug}`} className="card group overflow-hidden hover:border-orange-200">
                    <div className="h-44 bg-navy-900 flex items-center justify-center text-5xl relative">
                      {article.category === 'Standards' ? '📐' : article.category === 'Procurement' ? '💰' : '📊'}
                      <div className="absolute top-3 left-3">
                        <span className="badge badge-new">{article.category}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> {article.reading_time} min read
                      </div>
                      <h3 className="font-bold text-navy-900 text-base leading-tight mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-4">{article.excerpt}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400">HoistMarket Editorial</span>
                        <span className="text-xs font-bold text-orange-500 group-hover:translate-x-1 transition-transform inline-block">Read →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* Static fallback */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { ico: '📐', cat: 'Standards', title: 'International Lifting Standards: ASME B30 vs ISO vs FEM', slug: 'asme-b30-vs-iso-vs-fem-lifting-standards', time: 14 },
                  { ico: '💰', cat: 'Procurement', title: 'Total Cost of Ownership in EOT Cranes: Why Initial Price is 40% of the Story', slug: 'eot-crane-total-cost-ownership-tco-guide', time: 12 },
                  { ico: '📊', cat: 'Market Intelligence', title: 'The State of Heavy Lifting 2026: India and West Africa Decouple from Global Downturns', slug: 'india-west-africa-lifting-market-2026', time: 11 },
                ].map((a) => (
                  <Link key={a.slug} href={`/knowledge-base/${a.slug}`} className="card group overflow-hidden hover:border-orange-200">
                    <div className="h-44 bg-navy-900 flex items-center justify-center text-5xl relative">
                      {a.ico}
                      <div className="absolute top-3 left-3"><span className="badge badge-new">{a.cat}</span></div>
                    </div>
                    <div className="p-5">
                      <div className="text-xs text-slate-400 mb-2 flex items-center gap-2"><Clock className="w-3 h-3" /> {a.time} min read</div>
                      <h3 className="font-bold text-navy-900 text-base leading-tight mb-3 group-hover:text-orange-600 transition-colors">{a.title}</h3>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400">HoistMarket Editorial</span>
                        <span className="text-xs font-bold text-orange-500">Read →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── VENDOR DIRECTORY ── */}
        <section className="py-20">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="eyebrow">Vendor Directory</div>
                <h2 className="section-title">Featured Verified Suppliers</h2>
              </div>
              <Link href="/directory" className="btn-ghost hidden sm:flex">
                Full Directory <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-0 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 mb-6">
              {vendors.length > 0 ? vendors.map(v => (
                <div key={v.id} className="bg-white hover:bg-slate-50 transition-colors p-5 flex items-start gap-5 group">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border border-slate-200">
                    {v.logo_url ? <img src={v.logo_url} alt={v.company_name} className="w-full h-full object-contain rounded-xl p-1" /> : v.company_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <h3 className="font-bold text-navy-900 text-base group-hover:text-orange-600 transition-colors">{v.company_name}</h3>
                      <div className="flex items-center gap-2">
                        {v.verified && <span className="badge badge-verified"><CheckCircle className="w-3 h-3" /> Verified</span>}
                        <span className="badge badge-featured"><Star className="w-3 h-3 fill-current" /> Featured</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 mb-2">{v.city}, {v.country}</p>
                    <p className="text-sm text-slate-600 line-clamp-1 mb-2">{v.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {v.equipment_categories?.slice(0, 4).map((cat: string) => (
                        <span key={cat} className="badge badge-free text-xs">{cat}</span>
                      ))}
                    </div>
                  </div>
                  <Link href="/contact" className="btn-ghost btn-sm flex-shrink-0 hidden sm:flex">
                    Get Quote
                  </Link>
                </div>
              )) : (
                /* Static fallback */
                [
                  { nm: 'Hindustan Crane & Hoist Pvt Ltd', city: 'Mumbai', country: 'India', cats: ['EOT Crane', 'Wire Rope Hoist', 'Chain Hoist'], desc: 'India\'s leading EOT crane and wire rope hoist manufacturer. 40+ years serving steel, cement, and power sectors.' },
                  { nm: 'Gulf Crane Solutions LLC', city: 'Dubai', country: 'UAE', cats: ['Mobile Crane', 'All-Terrain', 'Crawler'], desc: 'Premium crane rental across UAE, Saudi Arabia, Qatar for oil & gas and infrastructure EPC projects.' },
                  { nm: 'Konecranes India Pvt Ltd', city: 'Chennai', country: 'India', cats: ['EOT Crane', 'Process Cranes', 'Port Cranes'], desc: 'Global OEM with full-service India operations. Overhead cranes, port cranes, and industrial service contracts.' },
                ].map((v, i) => (
                  <div key={i} className="bg-white hover:bg-slate-50 transition-colors p-5 flex items-start gap-5 group">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border border-slate-200">
                      <span className="font-bold text-navy-700 text-lg">{v.nm.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <h3 className="font-bold text-navy-900 text-base group-hover:text-orange-600 transition-colors">{v.nm}</h3>
                        <div className="flex items-center gap-2">
                          <span className="badge badge-verified"><CheckCircle className="w-3 h-3" /> Verified</span>
                          <span className="badge badge-featured"><Star className="w-3 h-3 fill-current" /> Featured</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mt-1 mb-2">{v.city}, {v.country}</p>
                      <p className="text-sm text-slate-600 line-clamp-1 mb-2">{v.desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {v.cats.map((cat: string) => <span key={cat} className="badge badge-free text-xs">{cat}</span>)}
                      </div>
                    </div>
                    <Link href="/contact" className="btn-ghost btn-sm flex-shrink-0 hidden sm:flex">Get Quote</Link>
                  </div>
                ))
              )}
            </div>

            <div className="text-center">
              <Link href="/directory" className="btn-secondary">Browse All 500+ Vendors</Link>
            </div>
          </div>
        </section>

        {/* ── RFQ CTA ── */}
        <section className="py-20 bg-navy-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-orange-500/8 to-transparent" />
          <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="eyebrow-light">RFQ Broker Engine</div>
              <h2 className="section-title-light mb-4">
                Need Lifting Equipment?<br/>
                <span className="text-orange-500">We Match You to Verified Vendors.</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-8">
                Submit your requirements once. HoistMarket reviews, matches, and forwards to 2–5 
                verified vendors. Vendor contacts remain private until match is confirmed. 
                You receive competitive quotes within 48–72 hours.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="btn-primary btn-lg">
                  <Zap className="w-5 h-5" />
                  Request a Quote Now
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { n: '24h', label: 'RFQ Review Time' },
                  { n: '2-5', label: 'Vendor Quotes' },
                  { n: '100%', label: 'Commission-Free' },
                  { n: 'Free', label: 'To Submit' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/8 rounded-lg px-4 py-3">
                    <div className="text-xl font-bold text-white">{s.n}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── RENTAL MARKETS ── */}
        <section className="py-20 bg-navy-950">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="eyebrow-light">Rental Marketplace</div>
                <h2 className="section-title-light">Find Equipment by Region & Type</h2>
              </div>
              <Link href="/rentals" className="btn-ghost hidden sm:flex">View All →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {rentalMarkets.map((m) => (
                <Link
                  key={m.region}
                  href={m.href}
                  className="bg-white/5 border border-white/8 rounded-xl p-5 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-200 group"
                >
                  <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400/80 mb-2">{m.region}</div>
                  <div className="font-bold text-white text-base mb-1 group-hover:text-orange-400 transition-colors">{m.cat}</div>
                  <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">View verified rental partners →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── NEWS ── */}
        <section className="py-20 bg-navy-900">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="eyebrow-light">Industry News</div>
                <h2 className="section-title-light">Latest from the Sector</h2>
              </div>
              <Link href="/news" className="btn-ghost hidden sm:flex">All News →</Link>
            </div>
            <div className="space-y-0 divide-y divide-white/5">
              {newsItems.map((item, i) => (
                <Link
                  key={i}
                  href="/news"
                  className="flex items-center gap-6 py-5 group hover:bg-white/2 transition-colors rounded px-2 -mx-2"
                >
                  <span className="text-3xl font-extrabold text-white/5 w-10 text-right flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold tracking-wider uppercase text-orange-400 mr-3">{item.tag}</span>
                    <span className="font-semibold text-white group-hover:text-orange-300 transition-colors">{item.title}</span>
                  </div>
                  <span className="text-xs text-slate-600 flex-shrink-0 hidden sm:block">{item.date}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── MONETIZATION / RAZORPAY ── */}
        <section className="py-10 bg-slate-50 border-y border-slate-200">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-[#072B4F] to-[#0F4F8F] rounded-xl p-5 flex items-center gap-4 text-white">
                <div className="bg-white/15 px-3 py-2 rounded text-sm font-bold font-mono">
                  R<span className="text-yellow-400">Pay</span>
                </div>
                <div>
                  <div className="font-bold text-sm mb-0.5">Razorpay Payment Integration</div>
                  <div className="text-xs text-blue-200/70">Vendor memberships & commission billing — INR, USD, AED</div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
                <div className="text-3xl flex-shrink-0">📢</div>
                <div>
                  <div className="font-bold text-sm text-navy-900 mb-0.5">Sponsored Placement Available</div>
                  <div className="text-xs text-slate-500">Homepage banners, sidebar widgets, featured directory slots</div>
                </div>
                <Link href="/advertise" className="btn-ghost btn-sm ml-auto flex-shrink-0 hidden sm:flex">Enquire</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
