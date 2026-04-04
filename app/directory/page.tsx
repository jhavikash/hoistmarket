import type { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import DirectoryClient from './DirectoryClient'
import type { Database } from '@/types/database'

export const metadata: Metadata = {
  title: 'Vendor Directory — Lifting Equipment Suppliers | HoistMarket',
  description:
    'Verified directory of lifting equipment suppliers and crane rental companies across India, GCC, and West Africa. Search by equipment category, region, and membership tier.',
}

export const revalidate = 120 // revalidate every 2 minutes

export default async function DirectoryPage() {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Server-side initial fetch — fast SSR for SEO
  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_active', true)
    .order('featured', { ascending: false })
    .order('tier', { ascending: false })
    .order('verified', { ascending: false })
    .order('company_name', { ascending: true })

  const allVendors = vendors ?? []
  const verifiedCount = allVendors.filter(v => v.verified).length
  const featuredCount = allVendors.filter(v => v.featured).length

  return (
    <>
      <Navbar />
      <main>
        {/* Page Hero */}
        <div className="bg-navy-950 pt-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-3">
              Vendor Directory
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Lifting Equipment<br />
              <span className="text-orange-500">Suppliers & Rental Partners</span>
            </h1>
            <p className="text-slate-400 text-base max-w-2xl leading-relaxed mb-4">
              Verified vendors across India, GCC, and West Africa. Search by equipment
              category, region, and membership tier. Submit an RFQ to receive matched quotes.
            </p>
            <div className="flex items-center gap-5 text-sm text-slate-500">
              <span>
                <span className="text-white font-bold">{allVendors.length}</span> vendors listed
              </span>
              <span>
                <span className="text-white font-bold">{verifiedCount}</span> verified
              </span>
              <span>
                <span className="text-white font-bold">{featuredCount}</span> featured partners
              </span>
            </div>
          </div>
        </div>

        {/* Client component handles search/filter/RFQ with initial data from SSR */}
        <DirectoryClient initialVendors={allVendors} />

        {/* List Your Company CTA */}
        <section className="py-14 bg-navy-950">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-navy-800 border border-navy-700 rounded-2xl p-8 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-3">
                    Join HoistMarket
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">List Your Company</h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">
                    Reach EPC procurement managers, plant engineers, and project heads actively
                    sourcing lifting equipment. Free listing — upgrade to receive matched RFQs.
                  </p>
                  <div className="space-y-2">
                    {[
                      'Free basic listing — no credit card required',
                      'Verified badge builds trust with buyers',
                      'Receive matched RFQs directly to your inbox',
                      'Featured tier prioritises your listing in search',
                    ].map(f => (
                      <div key={f} className="flex items-center gap-2 text-sm text-slate-400">
                        <div className="w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        </div>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { tier: 'Free', price: '₹0', period: 'Forever', desc: 'Basic listing + profile', cta: 'List Free', href: '/vendor/onboard', highlight: false },
                    { tier: 'Standard', price: '₹5,000', period: '/year', desc: 'Verified badge + RFQ access', cta: 'Get Standard', href: '/advertise', highlight: false },
                    { tier: 'Featured', price: '₹18,000', period: '/year', desc: 'Homepage + priority RFQs', cta: 'Get Featured', href: '/advertise', highlight: true },
                  ].map(plan => (
                    <div key={plan.tier} className={`flex items-center gap-4 px-5 py-4 rounded-xl border ${plan.highlight ? 'border-orange-500 bg-orange-500/10' : 'border-navy-600 bg-navy-700/50'}`}>
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm">{plan.tier}</div>
                        <div className="text-slate-400 text-xs">{plan.desc}</div>
                      </div>
                      <div className="text-right mr-2">
                        <span className="font-extrabold text-orange-400 text-lg">{plan.price}</span>
                        <span className="text-slate-500 text-xs">{plan.period}</span>
                      </div>
                      <a href={plan.href} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex-shrink-0 ${plan.highlight ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border border-white/20 text-white/80 hover:bg-white/10'}`}>
                        {plan.cta}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
