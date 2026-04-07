import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabaseServer'
import Link from 'next/link'
import { ArrowRight, MapPin, Zap, CheckCircle, Clock, Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Equipment Rentals — Cranes & Lifting Equipment | HoistMarket',
  description:
    'Find crane and lifting equipment rentals across India, GCC, and West Africa. Submit one RFQ and receive matched quotes from verified rental partners within 48 hours.',
}

const RENTAL_MARKETS = [
  {
    region: 'India — Mumbai & Maharashtra',
    slug: 'crawler-cranes-india',
    categories: ['Crawler Crane', 'Mobile Crane', 'All-Terrain Crane'],
    vendorCount: 8,
    avgResponse: '24h',
    flag: '🇮🇳',
  },
  {
    region: 'UAE / Dubai',
    slug: 'mobile-cranes-uae',
    categories: ['Mobile Crane', 'Tower Crane', 'All-Terrain Crane'],
    vendorCount: 12,
    avgResponse: '24h',
    flag: '🇦🇪',
  },
  {
    region: 'Saudi Arabia',
    slug: 'tower-cranes-gcc',
    categories: ['Tower Crane', 'Crawler Crane', 'Material Handling'],
    vendorCount: 6,
    avgResponse: '48h',
    flag: '🇸🇦',
  },
  {
    region: 'India — Gujarat & Mumbai',
    slug: 'eot-cranes-india',
    categories: ['EOT Crane', 'Gantry Crane', 'Wire Rope Hoist'],
    vendorCount: 11,
    avgResponse: '24h',
    flag: '🇮🇳',
  },
  {
    region: 'Nigeria / Lagos',
    slug: 'equipment-nigeria',
    categories: ['Mobile Crane', 'All-Terrain Crane', 'Rigging Gear'],
    vendorCount: 4,
    avgResponse: '48h',
    flag: '🇳🇬',
  },
  {
    region: 'Ghana & West Africa',
    slug: 'equipment-west-africa',
    categories: ['Material Handling', 'Port Equipment', 'Mobile Crane'],
    vendorCount: 3,
    avgResponse: '48h',
    flag: '🇬🇭',
  },
  {
    region: 'Qatar',
    slug: 'equipment-qatar',
    categories: ['Tower Crane', 'All-Terrain Crane', 'Crawler Crane'],
    vendorCount: 5,
    avgResponse: '24h',
    flag: '🇶🇦',
  },
  {
    region: 'India — Chennai & South',
    slug: 'equipment-south-india',
    categories: ['EOT Crane', 'Jib Crane', 'Process Crane'],
    vendorCount: 7,
    avgResponse: '24h',
    flag: '🇮🇳',
  },
]

const EQUIPMENT_TYPES = [
  { name: 'EOT / Overhead Cranes', icon: '🏗️', capacity: 'Up to 800t', href: '/equipment/overhead-cranes' },
  { name: 'All-Terrain Cranes', icon: '🚧', capacity: 'Up to 1,600t', href: '/equipment/mobile-cranes' },
  { name: 'Crawler Cranes', icon: '⛏️', capacity: 'Up to 4,000t', href: '/equipment/mobile-cranes' },
  { name: 'Tower Cranes', icon: '🏙️', capacity: 'Up to 80m radius', href: '/equipment/tower-cranes' },
  { name: 'Wire Rope Hoists', icon: '⚙️', capacity: 'Up to 200t', href: '/equipment/hoists' },
  { name: 'Rigging & Slings', icon: '🔗', capacity: 'WLL up to 1,000t', href: '/equipment/rigging' },
]

async function getFeaturedRentalVendors() {
  const supabase = await createSupabaseServer()
  const { data } = await supabase
    .from('vendors')
    .select('id, company_name, slug, city, country, equipment_categories, verified, tier, logo_url')
    .eq('is_active', true)
    .in('tier', ['featured', 'standard'])
    .eq('verified', true)
    .limit(6)
  return data || []
}

export default async function RentalsPage() {
  const supabase = await createSupabaseServer()
  const featuredVendors = await getFeaturedRentalVendors()

  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <div className="bg-navy-950 pt-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="max-w-3xl">
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-3">
                Rental Marketplace
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
                Find Rental Equipment<br/>
                <span className="text-orange-500">Matched to Your Project</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Submit one RFQ and receive 2–5 competitive quotes from verified rental partners 
                across India, GCC, and West Africa. Vendor contacts stay private until a match is confirmed.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/contact" className="btn-primary btn-lg group">
                  <Zap className="w-5 h-5" />
                  Request Rental Quote
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/directory" className="btn-outline-light btn-lg">
                  Browse All Vendors
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="bg-navy-900 border-b border-white/5 py-10">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { step: '01', icon: Zap, title: 'Submit RFQ', desc: 'Fill in your equipment needs, capacity, region, and timeline.' },
                { step: '02', icon: Shield, title: 'HoistMarket Reviews', desc: 'We verify your requirements and match to relevant vendors.' },
                { step: '03', icon: CheckCircle, title: 'Vendors Respond', desc: 'Matched vendors receive your RFQ via BCC and send quotes.' },
                { step: '04', icon: Clock, title: 'You Select', desc: 'Compare 2–5 competitive quotes and engage directly.' },
              ].map(item => (
                <div key={item.step} className="flex flex-col items-start">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-black text-orange-500/30">{item.step}</span>
                    <item.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RENTAL MARKETS GRID */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">Active Markets</div>
              <h2 className="text-3xl font-bold text-navy-900">Browse by Region & Equipment Type</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {RENTAL_MARKETS.map(market => (
                <Link
                  key={market.slug}
                  href={`/rentals/${market.slug}`}
                  className="card p-5 hover:border-orange-300 group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{market.flag}</span>
                    <span className="text-xs text-slate-400 font-medium">{market.vendorCount} vendors</span>
                  </div>
                  <h3 className="font-bold text-navy-900 text-sm mb-2 group-hover:text-orange-600 transition-colors">
                    {market.region}
                  </h3>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {market.categories.slice(0, 2).map(c => (
                      <span key={c} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{c}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3 h-3" /> Avg. response: {market.avgResponse}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* EQUIPMENT TYPES */}
        <section className="py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">Equipment Types</div>
              <h2 className="text-3xl font-bold text-navy-900">Available for Rental</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {EQUIPMENT_TYPES.map(eq => (
                <Link
                  key={eq.name}
                  href={eq.href}
                  className="card p-5 text-center hover:border-orange-200 group"
                >
                  <div className="text-3xl mb-3">{eq.icon}</div>
                  <div className="font-bold text-navy-900 text-sm mb-1 group-hover:text-orange-600 transition-colors leading-tight">{eq.name}</div>
                  <div className="text-xs text-slate-500">{eq.capacity}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED VENDORS */}
        {featuredVendors.length > 0 && (
          <section className="py-16 bg-slate-50">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">Verified Partners</div>
                  <h2 className="text-3xl font-bold text-navy-900">Featured Rental Companies</h2>
                </div>
                <Link href="/directory" className="btn-ghost hidden sm:flex">View All →</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredVendors.map(v => (
                  <Link key={v.id} href={`/directory/${v.slug}`} className="card p-5 hover:border-orange-200 group">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg border border-slate-200 flex-shrink-0">
                        {v.logo_url ? <img src={v.logo_url} alt={v.company_name} className="w-full h-full object-contain p-1 rounded-lg" /> : v.company_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-navy-900 text-sm group-hover:text-orange-600 transition-colors">{v.company_name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{v.city}, {v.country}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {v.equipment_categories?.slice(0, 3).map((c: string) => (
                        <span key={c} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{c}</span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* BOTTOM CTA */}
        <section className="py-16 bg-navy-900">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Find Your Equipment?</h2>
            <p className="text-slate-400 text-base mb-8 max-w-lg mx-auto">
              Submit your RFQ now and receive competitive quotes from verified rental partners within 48 hours.
            </p>
            <Link href="/contact" className="btn-primary btn-lg">
              <Zap className="w-5 h-5" /> Submit RFQ — It's Free
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
