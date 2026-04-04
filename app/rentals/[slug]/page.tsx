import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Zap, ArrowLeft, CheckCircle, Clock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

const RENTAL_MARKET_DATA: Record<string, {
  title: string
  region: string
  categories: string[]
  description: string
  seoTitle: string
  seoDesc: string
}> = {
  'crawler-cranes-india': {
    title: 'Crawler Crane Rental — India',
    region: 'india',
    categories: ['Crawler Crane', 'Mobile Crane', 'All-Terrain Crane'],
    description: 'Find verified crawler crane rental partners across Mumbai, Delhi NCR, Gujarat, and major industrial hubs in India.',
    seoTitle: 'Crawler Crane Rental India — Verified Suppliers | HoistMarket',
    seoDesc: 'Find crawler crane rental companies across India. Verified suppliers in Mumbai, Delhi, Gujarat. Submit RFQ and receive 2–5 competitive quotes within 48 hours.',
  },
  'mobile-cranes-uae': {
    title: 'Mobile Crane Rental — UAE / Dubai',
    region: 'gcc',
    categories: ['Mobile Crane', 'All-Terrain Crane', 'Tower Crane'],
    description: 'Verified mobile and all-terrain crane rental partners in UAE, Dubai, Abu Dhabi, and across the GCC.',
    seoTitle: 'Mobile Crane Rental UAE Dubai — Verified Suppliers | HoistMarket',
    seoDesc: 'Find mobile crane rental companies in UAE and Dubai. Verified suppliers for oil & gas, infrastructure, and construction projects. Submit RFQ free.',
  },
  'tower-cranes-gcc': {
    title: 'Tower Crane Rental — Saudi Arabia & GCC',
    region: 'gcc',
    categories: ['Tower Crane', 'Luffing Jib', 'Hammerhead Crane'],
    description: 'Verified tower crane rental partners across Saudi Arabia, Qatar, Kuwait, and the wider GCC region.',
    seoTitle: 'Tower Crane Rental Saudi Arabia GCC | HoistMarket',
    seoDesc: 'Tower crane rental companies in Saudi Arabia and GCC. Verified partners for construction and infrastructure projects. Free RFQ.',
  },
  'eot-cranes-india': {
    title: 'EOT Crane Rental — India',
    region: 'india',
    categories: ['EOT Crane', 'Overhead Crane', 'Gantry Crane'],
    description: 'Verified EOT and overhead crane rental and lease partners across India for steel plants, warehouses, and manufacturing facilities.',
    seoTitle: 'EOT Crane Rental India — Overhead Crane Lease | HoistMarket',
    seoDesc: 'EOT and overhead crane rental in India. Verified suppliers for steel, cement, power, and manufacturing sectors. Free RFQ.',
  },
  'equipment-nigeria': {
    title: 'Heavy Lift Equipment — Nigeria',
    region: 'africa',
    categories: ['Mobile Crane', 'All-Terrain Crane', 'Rigging Gear'],
    description: 'Verified heavy lift and crane rental partners across Nigeria, Lagos, and the Niger Delta for oil & gas and infrastructure projects.',
    seoTitle: 'Heavy Lift Equipment Rental Nigeria Lagos | HoistMarket',
    seoDesc: 'Find crane and heavy lift equipment rental in Nigeria and Lagos. Verified suppliers for oil & gas and infrastructure. Submit RFQ free.',
  },
  'equipment-west-africa': {
    title: 'Material Handling — West Africa',
    region: 'africa',
    categories: ['Material Handling', 'Port Equipment', 'Mobile Crane'],
    description: 'Verified lifting equipment and material handling suppliers across Ghana, Ivory Coast, Liberia, and West Africa.',
    seoTitle: 'Lifting Equipment West Africa — Ghana Nigeria Liberia | HoistMarket',
    seoDesc: 'Find lifting and material handling equipment in West Africa. Verified suppliers across Ghana, Liberia, Nigeria, Ivory Coast. Free RFQ.',
  },
  'equipment-qatar': {
    title: 'Crane Rental — Qatar',
    region: 'gcc',
    categories: ['Tower Crane', 'All-Terrain Crane', 'Crawler Crane'],
    description: 'Verified crane rental partners in Qatar for construction, oil & gas, and infrastructure projects.',
    seoTitle: 'Crane Rental Qatar — Verified Suppliers | HoistMarket',
    seoDesc: 'Crane rental companies in Qatar. Verified suppliers for construction and infrastructure. Submit RFQ free.',
  },
  'equipment-south-india': {
    title: 'Industrial Cranes — South India',
    region: 'india',
    categories: ['EOT Crane', 'Jib Crane', 'Process Crane'],
    description: 'Verified industrial crane suppliers and rental companies across Chennai, Bangalore, Hyderabad, and South India.',
    seoTitle: 'Industrial Crane Rental South India — Chennai | HoistMarket',
    seoDesc: 'Find industrial crane rental in South India. Verified suppliers in Chennai, Bangalore, Hyderabad. Free RFQ.',
  },
}

interface PageProps { params: { slug: string } }

export async function generateStaticParams() {
  const supabase = createServerComponentClient<Database>({ cookies })
  return Object.keys(RENTAL_MARKET_DATA).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const market = RENTAL_MARKET_DATA[params.slug]
  if (!market) return { title: 'Market Not Found' }
  return {
    title: market.seoTitle,
    description: market.seoDesc,
  }
}

export default async function RentalMarketPage({ params }: PageProps) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const market = RENTAL_MARKET_DATA[params.slug]
  if (!market) notFound()

  const { data: vendors } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_active', true)
    .eq('region', market.region)
    .eq('verified', true)
    .limit(12)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: market.title,
    description: market.description,
    provider: { '@type': 'Organization', name: 'HoistMarket', url: 'https://hoistmarket.com' },
    areaServed: market.region,
    serviceType: market.categories[0],
  }

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="pt-16">
        <div className="bg-navy-950">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-slate-300">Home</Link>
              <span>/</span>
              <Link href="/rentals" className="hover:text-slate-300">Rentals</Link>
              <span>/</span>
              <span className="text-slate-400">{market.title}</span>
            </nav>
          </div>
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">{market.title}</h1>
            <p className="text-slate-400 text-lg max-w-2xl mb-6">{market.description}</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {market.categories.map(c => (
                <span key={c} className="px-3 py-1 bg-white/10 text-white text-sm font-medium rounded-full border border-white/20">{c}</span>
              ))}
            </div>
            <button className="btn-primary btn-lg">
              <Zap className="w-5 h-5" /> Request Rental Quote
            </button>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {vendors && vendors.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-navy-900 mb-6">
                {vendors.length} Verified Partner{vendors.length !== 1 ? 's' : ''} in This Market
              </h2>
              <div className="space-y-0 divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {vendors.map(v => (
                  <div key={v.id} className="bg-white hover:bg-slate-50 transition-colors p-5 flex items-start gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xl border border-slate-200 flex-shrink-0">
                      {v.logo_url ? <img src={v.logo_url} alt={v.company_name} className="w-full h-full object-contain p-1 rounded-lg" /> : v.company_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link href={`/directory/${v.slug}`} className="font-bold text-navy-900 hover:text-orange-600 transition-colors">{v.company_name}</Link>
                        {v.verified && <span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3 h-3" /> Verified</span>}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1 mb-2"><MapPin className="w-3 h-3" /> {v.city}, {v.country}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {v.equipment_categories?.slice(0, 4).map((c: string) => (
                          <span key={c} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">{c}</span>
                        ))}
                      </div>
                    </div>
                    <button className="btn-primary btn-sm flex-shrink-0 hidden sm:flex">Get Quote</button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">Building This Market</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                We're onboarding verified vendors for this region. Submit an RFQ and we'll manually source matches for you.
              </p>
              <button className="btn-primary">
                <Zap className="w-4 h-4" /> Submit RFQ Anyway
              </button>
            </div>
          )}

          <div className="mt-8">
            <Link href="/rentals" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to All Rental Markets
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
