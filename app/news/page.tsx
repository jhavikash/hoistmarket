import type { Metadata } from 'next'
import Link from 'next/link'
import { Tag, Clock, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Industry News — Lifting Equipment & Crane Industry Updates | HoistMarket',
  description:
    'Latest news from the global lifting equipment and crane industry. Regulatory updates, market intelligence, safety bulletins, and technology news for lifting professionals.',
}

const NEWS_ITEMS = [
  {
    day: '24', month: 'Mar', year: '2026',
    tag: 'Regulation', tagColor: 'bg-red-50 text-red-700 border-red-200',
    title: 'OSHA Publishes Revised Cranes & Derricks Rule: What Changes in 2026',
    excerpt: 'The revised rule expands required certifications to operators of cranes under 2,000 lbs capacity on certain construction sites. Compliance date set for Q3 2026. Key changes include new requirements for operator qualification documentation and increased inspection frequency for equipment over 10 years old.',
    readTime: 5,
  },
  {
    day: '20', month: 'Mar', year: '2026',
    tag: 'Market', tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'PM Gati Shakti: Rs 11 Lakh Crore Infrastructure Push Drives Crane Demand Surge',
    excerpt: 'India\'s National Master Plan for Multi-Modal Connectivity is generating unprecedented lifting equipment demand across railway, port, and energy sectors. Lead times for 50t+ EOT cranes have stretched to 28–36 weeks.',
    readTime: 7,
  },
  {
    day: '16', month: 'Mar', year: '2026',
    tag: 'Technology', tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
    title: 'AI Load Path Analysis Cuts LLTR Engineering Time by 40% — ConExpo 2026',
    excerpt: 'AI-assisted load path analysis tools unveiled at ConExpo 2026 are reducing Lifting Load and Tie-Down Report engineering time significantly. Sarens and ALE both announced digital engineering integrations.',
    readTime: 4,
  },
  {
    day: '11', month: 'Mar', year: '2026',
    tag: 'Safety', tagColor: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    title: 'LEEA Revises Wire Rope Inspection Intervals for High-Cycle Applications',
    excerpt: 'New guidance reduces mandatory inspection intervals for slings used in more than 10 lifts per shift to a maximum 3-month period, regardless of visual condition. LEEA members should update their inspection schedules immediately.',
    readTime: 3,
  },
  {
    day: '07', month: 'Mar', year: '2026',
    tag: 'Projects', tagColor: 'bg-green-50 text-green-700 border-green-200',
    title: 'NEOM Site Deploys 14 Liebherr LR 13000 Crawlers Simultaneously',
    excerpt: 'The Saudi mega-project has deployed the largest known concentration of large-capacity crawler cranes on a single site, with 14 LR 13000 units working simultaneously on structural works.',
    readTime: 4,
  },
  {
    day: '01', month: 'Mar', year: '2026',
    tag: 'Standards', tagColor: 'bg-orange-50 text-orange-700 border-orange-200',
    title: 'BSI Releases EN 13000:2025 — Updated European Standard for Mobile Cranes',
    excerpt: 'The revised standard introduces new requirements for rated capacity limiter systems and adds mandatory wind speed monitoring thresholds for cranes over 100t capacity.',
    readTime: 5,
  },
  {
    day: '24', month: 'Feb', year: '2026',
    tag: 'Market', tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
    title: 'West Africa Port Expansion Wave: 5 Major Projects Driving Crane Demand',
    excerpt: 'Tema, Lekki, Monrovia, Abidjan, and Dakar port expansion projects are creating significant demand for ship-to-shore cranes, RTGs, and reach stackers across West Africa.',
    readTime: 8,
  },
  {
    day: '18', month: 'Feb', year: '2026',
    tag: 'Safety', tagColor: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    title: 'DNV Issues Revised Guidelines for Subsea Lift Operations Below 1,000m',
    excerpt: 'New GL guidelines address dynamic amplification factors at depth, updated fatigue calculations for deep-water crane wire rope, and emergency recovery procedures for stuck loads.',
    readTime: 6,
  },
]

const TAGS = ['All', 'Regulation', 'Market', 'Safety', 'Technology', 'Standards', 'Projects', 'Offshore']

const QUICK_LINKS = [
  { label: 'ASME B30 vs FEM vs ISO Guide', href: '/knowledge-base/asme-b30-vs-iso-vs-fem-lifting-standards' },
  { label: 'EOT Crane TCO Analysis', href: '/knowledge-base/eot-crane-total-cost-ownership-tco-guide' },
  { label: 'India Lifting Market 2026', href: '/knowledge-base/india-west-africa-lifting-market-2026' },
  { label: 'Vendor Directory', href: '/directory' },
  { label: 'Equipment Hub', href: '/equipment' },
]

export default function NewsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <div className="bg-navy-950 pt-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-3">Industry News</div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
              Latest from the<br/><span className="text-orange-500">Lifting Sector</span>
            </h1>
            <p className="text-slate-400 text-base max-w-xl">
              Regulatory changes, market intelligence, safety bulletins, and technology updates — curated for lifting professionals.
            </p>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* MAIN FEED */}
            <div className="lg:col-span-2">
              {/* Filter tabs */}
              <div className="flex items-center gap-2 flex-wrap mb-8">
                {TAGS.map((tag, i) => (
                  <button
                    key={tag}
                    className={`px-4 py-2 text-xs font-bold rounded-full border transition-colors ${
                      i === 0
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* News articles */}
              <div className="space-y-0 divide-y divide-slate-100">
                {NEWS_ITEMS.map((item, i) => (
                  <article key={i} className="py-7 group cursor-pointer hover:bg-slate-50/50 -mx-4 px-4 transition-colors rounded-lg">
                    <div className="flex items-start gap-5">
                      {/* Date */}
                      <div className="bg-navy-900 rounded-xl p-3 text-center flex-shrink-0 w-14">
                        <div className="text-2xl font-extrabold text-white leading-none">{item.day}</div>
                        <div className="text-xs font-bold text-orange-400 uppercase tracking-wide mt-0.5">{item.month}</div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${item.tagColor}`}>
                            {item.tag}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.readTime} min read
                          </span>
                        </div>
                        <h2 className="font-bold text-navy-900 text-lg leading-snug mb-2 group-hover:text-orange-600 transition-colors">
                          {item.title}
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-3">{item.excerpt}</p>
                        <span className="text-xs font-bold text-orange-500 flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read more <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-5 lg:sticky lg:top-24">
              {/* Get Quote CTA */}
              <div className="bg-navy-900 rounded-xl p-5">
                <h3 className="text-white font-bold text-base mb-2">Need Equipment?</h3>
                <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                  Submit an RFQ and receive matched quotes from verified vendors within 48 hours.
                </p>
                <button className="btn-primary w-full justify-center py-2.5 text-sm">
                  Request a Quote →
                </button>
              </div>

              {/* Quick Links */}
              <div className="card p-5">
                <h3 className="font-bold text-navy-900 text-sm mb-4 pb-2 border-b-2 border-orange-500 inline-block">
                  Technical Resources
                </h3>
                <div className="space-y-2">
                  {QUICK_LINKS.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center justify-between text-sm text-slate-600 hover:text-orange-600 py-2 border-b border-slate-100 last:border-0 transition-colors group"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Standards Coverage */}
              <div className="card p-5">
                <h3 className="font-bold text-navy-900 text-sm mb-4">Standards We Cover</h3>
                <div className="flex flex-wrap gap-1.5">
                  {['ASME B30', 'FEM 1.001', 'EN 13000', 'LOLER 1998', 'DNV GL', 'ISO 4306', 'OSHA 1926.1400', 'API 2C', 'IS 3177'].map(s => (
                    <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium">{s}</span>
                  ))}
                </div>
              </div>

              {/* Sponsored */}
              <div className="bg-gradient-to-br from-navy-900 to-navy-800 border border-navy-700 rounded-xl p-5 relative overflow-hidden">
                <span className="absolute top-2 right-2 text-[9px] text-white/25 font-bold tracking-widest uppercase">SPONSORED</span>
                <div className="text-2xl mb-3">⚙️</div>
                <h4 className="text-white font-bold text-sm mb-1.5">Konecranes India</h4>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">Certified service partner for EOT cranes. 48-hour response SLA across India.</p>
                <button className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors">Learn More →</button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
