import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Mail, Linkedin, Globe, ArrowRight, TrendingUp, Users, BookOpen, Zap, Shield, Target, Award } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'About HoistMarket — B2B Platform for EOT Cranes & Industrial Lifting Equipment',
  description:
    'HoistMarket is the B2B knowledge platform and vendor directory for the EOT crane, hoist, and industrial lifting equipment industry. Connecting buyers with verified vendors worldwide.',
}

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
              The B2B knowledge platform and vendor directory for EOT cranes, hoists, and industrial
              lifting equipment. Connecting buyers with verified vendors worldwide.
            </p>
          </div>
        </div>

        {/* WHY HOISTMARKET EXISTS */}
        <section className="py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-3">Our Story</div>
                <h2 className="text-3xl font-bold text-navy-900 mb-5">Why HoistMarket Exists</h2>
                <p className="text-slate-600 leading-relaxed mb-5">
                  The lifting equipment industry — encompassing EOT cranes, hoists, rigging gear, 
                  and material handling systems — is a sector where procurement decisions involve high capital,
                  strict safety compliance, and long-term service relationships. Yet finding the right vendor
                  remains frustratingly difficult.
                </p>
                <p className="text-slate-600 leading-relaxed mb-5">
                  Procurement managers at EPC firms, plant engineers, and equipment distributors 
                  currently rely on fragmented sources: outdated trade directories, generic marketplaces 
                  that list everything from office supplies to cranes, word-of-mouth referrals,
                  and expensive trade shows.
                </p>
                <p className="text-slate-600 leading-relaxed mb-6">
                  HoistMarket addresses this gap directly. Built by a mechanical engineer with hands-on 
                  experience in the lifting equipment industry, designed specifically for the professionals 
                  who specify, procure, and maintain lifting equipment across
                  <strong className="text-navy-900"> India, the Middle East, Africa, Southeast Asia, and beyond</strong>.
                </p>
                <div className="space-y-2">
                  {[
                    'Specialist platform — 100% focused on lifting equipment, not a generic directory',
                    'Technical depth written by industry professionals, not content agencies',
                    'Free knowledge base — standards guides, spec references, and buying guides',
                    'Verified vendor profiles with certifications, equipment categories, and project history',
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
                      { label: 'Platform', value: 'HoistMarket' },
                      { label: 'Founded', value: '2026' },
                      { label: 'Focus', value: 'EOT Cranes · Hoists · Industrial Lifting' },
                      { label: 'Markets', value: 'India · GCC · Africa · SE Asia · Global' },
                      { label: 'Type', value: 'B2B Knowledge Platform & Vendor Directory' },
                      { label: 'For Buyers', value: 'Free RFQs · Vendor matching · Technical guides' },
                      { label: 'For Vendors', value: 'Directory listing · RFQ leads · Article publishing' },
                      { label: 'Contact', value: 'info@hoistmarket.com' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                        <span className="text-slate-500 font-medium">{label}</span>
                        <span className="text-navy-900 font-semibold text-right max-w-[220px]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mission */}
                <div className="bg-navy-900 rounded-xl p-6">
                  <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-3">Our Mission</div>
                  <blockquote className="text-white text-base leading-relaxed">
                    To become the most trusted specialist platform for the lifting equipment industry — 
                    connecting professionals with verified vendors, technical knowledge, and the right 
                    equipment for every project.
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT WE OFFER */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">What We Offer</div>
              <h2 className="text-3xl font-bold text-navy-900">Three Pillars of HoistMarket</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: BookOpen,
                  title: 'Knowledge Base',
                  desc: 'In-depth technical articles on crane specifications, lifting standards (ASME B30, FEM, EN), safety compliance, and procurement best practices. Written by industry professionals for industry professionals.',
                  color: 'text-blue-500',
                  bg: 'bg-blue-50 border-blue-200',
                },
                {
                  icon: Users,
                  title: 'Vendor Directory',
                  desc: 'Searchable directory of verified EOT crane manufacturers, hoist suppliers, component dealers, rigging companies, and inspection service providers. Filter by equipment type, region, and certifications.',
                  color: 'text-orange-500',
                  bg: 'bg-orange-50 border-orange-200',
                },
                {
                  icon: Zap,
                  title: 'RFQ Matching',
                  desc: 'Submit your equipment requirements once. Our matching engine connects you with 2–5 relevant verified vendors based on equipment category, region, and capacity. Receive competitive quotes within 24–48 hours.',
                  color: 'text-green-500',
                  bg: 'bg-green-50 border-green-200',
                },
              ].map(item => (
                <div key={item.title} className={`card p-6 border-2 ${item.bg}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white border">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <h3 className="font-bold text-navy-900 text-lg">{item.title}</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOR VENDORS */}
        <section className="py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">For Vendors</div>
                <h2 className="text-3xl font-bold text-navy-900 mb-5">Grow Your Business with HoistMarket</h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Whether you manufacture EOT cranes, supply hoists, deal in crane components, or provide 
                  inspection and maintenance services — HoistMarket puts your company in front of the procurement 
                  teams and plant engineers who are actively sourcing equipment.
                </p>
                <div className="space-y-3">
                  {[
                    'Free basic listing — get listed in minutes, no payment required',
                    'Verified badge — build trust with buyers through our verification process',
                    'Matched RFQ leads — receive buyer inquiries matched to your equipment and region',
                    'Publish articles — share your expertise and establish thought leadership',
                    'Featured placement — premium visibility on homepage and priority in search results',
                    'Analytics dashboard — track profile views, RFQ leads, and engagement',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link href="/vendor/onboard" className="btn-primary">
                    List Your Company Free <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">For Buyers</div>
                <h2 className="text-3xl font-bold text-navy-900 mb-5">Find the Right Vendor, Faster</h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Stop wasting time on generic marketplaces and outdated directories. HoistMarket is built 
                  specifically for the lifting equipment industry — every vendor is categorized by equipment 
                  type, certified capabilities, and service region.
                </p>
                <div className="space-y-3">
                  {[
                    'Search by equipment type — EOT cranes, hoists, jib cranes, components, rigging',
                    'Filter by region — India, GCC, Africa, Southeast Asia, Europe, Americas',
                    'View certifications — LEEA, BIS, ISO 9001, CE, ASME compliance',
                    'Submit one RFQ — get matched quotes from multiple verified vendors',
                    'Free to use — no buyer fees, ever',
                    'Technical knowledge base — make informed procurement decisions',
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link href="/contact" className="btn-primary">
                    Submit an RFQ <ArrowRight className="w-4 h-4" />
                  </Link>
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
                { value: 'Specialization', desc: 'We focus exclusively on lifting equipment. No office supplies, no generic industrial products. Just cranes, hoists, and lifting gear.' },
                { value: 'Neutrality', desc: 'We don\'t manufacture or distribute equipment. Our recommendations and vendor rankings are based on merit, not payments.' },
                { value: 'Expertise', desc: 'Content created by mechanical engineers and lifting professionals — technically accurate and practically useful.' },
                { value: 'Accessibility', desc: 'Technical knowledge that was previously locked behind trade associations and paywalls, made freely available to all professionals.' },
                { value: 'Trust', desc: 'Every vendor listing is reviewed. Certifications are verified. Buyers and vendors can transact with confidence.' },
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

        {/* EQUIPMENT COVERAGE */}
        <section className="py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">Coverage</div>
              <h2 className="text-3xl font-bold text-navy-900">Equipment Categories We Cover</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: '🏗️', name: 'EOT / Overhead Cranes', sub: 'Single & double girder, underslung' },
                { icon: '⚙️', name: 'Electric Hoists', sub: 'Chain hoists, wire rope hoists' },
                { icon: '🦾', name: 'Jib Cranes', sub: 'Pillar, wall-mounted, articulating' },
                { icon: '🔧', name: 'Gantry Cranes', sub: 'Full gantry, semi-gantry, portable' },
                { icon: '🔗', name: 'Rigging & Slings', sub: 'Wire rope, chain slings, shackles' },
                { icon: '📦', name: 'Crane Components', sub: 'End carriages, wheels, drives, controls' },
                { icon: '🛡️', name: 'Inspection & Testing', sub: 'Load testing, NDT, LOLER compliance' },
                { icon: '🔬', name: 'AMC & Services', sub: 'Maintenance, modernization, breakdown' },
              ].map(cat => (
                <div key={cat.name} className="card p-5 hover:border-orange-200 transition-all text-center">
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <h3 className="font-bold text-navy-900 text-sm mb-1">{cat.name}</h3>
                  <p className="text-slate-500 text-xs">{cat.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="py-16 bg-navy-900">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-3">Get in Touch</div>
            <h2 className="text-3xl font-bold text-white mb-4">Partner with HoistMarket</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
              Whether you're a vendor looking to list your company, a buyer sourcing equipment, 
              or an industry professional with content to contribute — we'd love to hear from you.
            </p>
            <a href="mailto:info@hoistmarket.com" className="text-2xl font-bold text-orange-400 hover:text-orange-300 transition-colors block mb-8">
              info@hoistmarket.com
            </a>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/contact" className="btn-primary btn-lg">
                <Mail className="w-5 h-5" /> Contact Us
              </Link>
              <Link href="/vendor/onboard" className="btn-outline-light btn-lg">
                List Your Company Free
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
