import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Mail, Linkedin, Globe, ArrowRight, TrendingUp, Users, BookOpen, Zap } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About HoistMarket — Global Lifting Equipment Reference Platform',
  description:
    'HoistMarket is an independent B2B reference platform for the lifting equipment and material handling industry. Founded 2026. Based in Monrovia, Liberia. Focused on India, GCC, and West Africa.',
}

const PHASES = [
  {
    phase: 'Phase 1',
    period: 'Months 1–6',
    title: 'Knowledge Base',
    desc: 'High-authority technical SEO content — crane specifications, ASME/EN lifting standards, project intelligence. Revenue from sponsored content and directory listings.',
    icon: BookOpen,
    color: 'text-blue-500',
    bg: 'bg-blue-50 border-blue-200',
  },
  {
    phase: 'Phase 2',
    period: 'Months 7–14',
    title: 'Rental Marketplace',
    desc: 'Managed-broker model for equipment rentals. Admin routes RFQ leads to verified vendors. Revenue from transaction commissions.',
    icon: Zap,
    color: 'text-orange-500',
    bg: 'bg-orange-50 border-orange-200',
  },
  {
    phase: 'Phase 3',
    period: 'Months 15–36',
    title: 'Product Marketplace',
    desc: 'Spare parts, lifting gear, and EOT cranes. Vendor memberships, market intelligence products, and virtual summits.',
    icon: TrendingUp,
    color: 'text-green-500',
    bg: 'bg-green-50 border-green-200',
  },
]

const MILESTONES = [
  { period: 'Month 6', milestone: 'Platform costs covered', mrr: '₹38K–75K/month' },
  { period: 'Month 12', milestone: 'Break-even target', mrr: '₹1.5L–2.8L/month' },
  { period: 'Month 24', milestone: 'Multi-stream maturity', mrr: '₹9.4L–16.6L/month' },
  { period: 'Month 36', milestone: 'Category leadership', mrr: '₹18.5L–33L/month' },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <div className="bg-navy-950 pt-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-3">About HoistMarket</div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5 max-w-3xl">
              Built by the Industry,<br/>
              <span className="text-orange-500">for the Industry</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              An independent B2B reference platform for the global lifting equipment and material handling industry. 
              No vendor bias. No paywalls. Built to compete on knowledge authority.
            </p>
          </div>
        </div>

        {/* THE OPPORTUNITY */}
        <section className="py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-3">The Opportunity</div>
                <h2 className="text-3xl font-bold text-navy-900 mb-5">Why HoistMarket Exists</h2>
                <p className="text-slate-600 leading-relaxed mb-5">
                  The lifting equipment industry — encompassing cranes, hoists, aerial work platforms, rigging gear, 
                  and material handling systems — is a sector valued at over <strong className="text-navy-900">USD 45 billion</strong> that 
                  remains critically underserved by modern information and commerce infrastructure.
                </p>
                <p className="text-slate-600 leading-relaxed mb-5">
                  Procurement managers at EPC firms, plant engineers, crane rental companies, and equipment distributors 
                  currently rely on fragmented sources: outdated trade directories, generic Google searches, industry trade shows, 
                  and personal networks.
                </p>
                <p className="text-slate-600 leading-relaxed mb-6">
                  HoistMarket addresses this gap directly. Built by an industry professional with first-hand experience 
                  across lifting equipment supply and project execution, designed to serve the intelligence and commerce 
                  needs of senior industrial professionals across <strong className="text-navy-900">India, the Middle East, Africa, and Southeast Asia</strong>.
                </p>
                <div className="space-y-2">
                  {[
                    'Vendor-neutral reference — no paid placements in editorial content',
                    'Technical depth written by lifting engineers, not content agencies',
                    'Free to access — knowledge base, standards guides, and spec tools',
                    'Broker model — commission only on completed transactions',
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                {/* Company Card */}
                <div className="card p-6">
                  <h3 className="font-bold text-navy-900 mb-4 text-sm uppercase tracking-wider">Company Overview</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Company', value: 'HoistMarket' },
                      { label: 'Founded', value: '2026' },
                      { label: 'Headquarters', value: 'Monrovia, Liberia' },
                      { label: 'Primary Markets', value: 'India · Gulf / GCC · West Africa' },
                      { label: 'Business Model', value: 'B2B Digital Platform' },
                      { label: 'Stage', value: 'Pre-revenue / Content Launch' },
                      { label: 'Contact', value: 'info@hoistmarket.com' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                        <span className="text-slate-500 font-medium">{label}</span>
                        <span className="text-navy-900 font-semibold text-right max-w-[200px]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mission */}
                <div className="bg-navy-900 rounded-xl p-6">
                  <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-3">Mission Statement</div>
                  <blockquote className="text-white text-base leading-relaxed italic">
                    "To become the world's most trusted neutral reference and marketplace platform 
                    for the lifting equipment and material handling industry — connecting professionals 
                    with knowledge, suppliers, and equipment across every major infrastructure market."
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-PHASE BUSINESS MODEL */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">Business Model</div>
              <h2 className="text-3xl font-bold text-navy-900">Three-Phase Platform Build</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {PHASES.map(phase => (
                <div key={phase.phase} className={`card p-6 border-2 ${phase.bg}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-white border`}>
                      <phase.icon className={`w-5 h-5 ${phase.color}`} />
                    </div>
                    <div>
                      <div className={`text-xs font-bold tracking-wider uppercase ${phase.color}`}>{phase.phase}</div>
                      <div className="text-xs text-slate-500">{phase.period}</div>
                    </div>
                  </div>
                  <h3 className="font-bold text-navy-900 text-lg mb-2">{phase.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{phase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REVENUE ROADMAP */}
        <section className="py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">Revenue Roadmap</div>
                <h2 className="text-3xl font-bold text-navy-900 mb-5">36-Month Financial Milestones</h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  HoistMarket requires no external investment to launch. The business is designed to be 
                  cash-flow positive within 12 months through seven diversified revenue streams.
                </p>
                <div className="space-y-3">
                  {['Sponsored content & brand partnerships', 'Vendor directory listings (Standard & Featured tiers)', 'RFQ broker commissions on completed rentals', 'Annual market intelligence reports', 'Vendor membership subscriptions', 'Ad placements (homepage, KB sidebar)', 'Virtual summit events (from Month 24+)'].map((stream, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      {stream}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="space-y-px">
                  {MILESTONES.map((m, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 p-5 flex items-center justify-between hover:bg-white transition-colors">
                      <div>
                        <div className="font-bold text-navy-900 text-sm">{m.period}</div>
                        <div className="text-slate-500 text-xs mt-0.5">{m.milestone}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-orange-500 text-lg">{m.mrr}</div>
                        <div className="text-xs text-slate-400">Monthly Revenue Target</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-navy-900 rounded-xl p-5">
                  <div className="text-xs font-bold tracking-wider uppercase text-orange-400 mb-2">36-Month Outcome</div>
                  <div className="text-white text-sm leading-relaxed">
                    400+ expert articles · 500+ verified vendors across 25+ countries · 80–120 active rental partners · 
                    10,000+ newsletter subscribers · Strategic value (3× ARR): <span className="text-orange-400 font-bold">₹6.6–12 crores</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">Core Values</div>
              <h2 className="text-3xl font-bold text-navy-900">What We Stand For</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { value: 'Neutrality', desc: 'No manufacturing or distribution interests. Independence makes every recommendation credible.' },
                { value: 'Expertise', desc: 'Content written by someone who has worked in this industry — not a generalist content agency.' },
                { value: 'Accessibility', desc: 'Information once locked inside trade associations is made freely available to all professionals.' },
                { value: 'Quality', desc: 'Fewer, better articles. Every piece must be genuinely useful to a working professional.' },
                { value: 'Long-term Thinking', desc: 'Every decision made with a 36-month horizon, not a short-term revenue target.' },
              ].map(item => (
                <div key={item.value} className="card p-5 hover:border-orange-200 transition-all">
                  <div className="w-2 h-8 bg-orange-500 rounded-full mb-3" />
                  <h3 className="font-bold text-navy-900 text-sm mb-2">{item.value}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="py-16 bg-navy-900">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-3">Get in Touch</div>
            <h2 className="text-3xl font-bold text-white mb-4">Contact HoistMarket</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              For technical submissions, content contributions, vendor directory enquiries, or partnership discussions. 
              Every substantive enquiry gets a personal response.
            </p>
            <a href="mailto:info@hoistmarket.com" className="text-2xl font-bold text-orange-400 hover:text-orange-300 transition-colors block mb-8">
              info@hoistmarket.com
            </a>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/contact" className="btn-primary btn-lg">
                <Zap className="w-5 h-5" /> Request a Quote
              </Link>
              <Link href="/directory/list-company" className="btn-outline-light btn-lg">
                List Your Company
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
