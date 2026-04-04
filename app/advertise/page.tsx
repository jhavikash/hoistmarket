import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Star, Zap, ArrowRight, Mail } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Advertise & Vendor Membership — HoistMarket',
  description: 'Reach lifting equipment professionals across India, GCC, and West Africa. Membership tiers, sponsored content, and banner ad placements.',
}

const TIERS = [
  {
    name: 'Free Listing',
    price_inr: '₹0',
    price_usd: '$0',
    period: 'Forever',
    highlight: false,
    badge: null,
    features: [
      'Basic directory listing',
      'Public company profile',
      'Equipment category tags',
      'Contact form (via HoistMarket)',
      'Company logo & description',
    ],
    cta: 'Get Free Listing',
    ctaHref: '/login?redirect=/vendor/onboard',
    ctaStyle: 'btn-outline',
  },
  {
    name: 'Standard',
    price_inr: '₹5,000',
    price_usd: '$60',
    period: '/year',
    highlight: false,
    badge: 'Most Popular',
    features: [
      '✓ Verified badge on listing',
      'Receive matched RFQs (up to 10/month)',
      'Enhanced listing with certifications',
      'Analytics: views & RFQ count',
      'Priority in regional search results',
      'Direct contact details shown',
    ],
    cta: 'Get Standard',
    ctaHref: '/login?redirect=/vendor/onboard?tier=standard',
    ctaStyle: 'btn-primary',
  },
  {
    name: 'Featured',
    price_inr: '₹18,000',
    price_usd: '$216',
    period: '/year',
    highlight: true,
    badge: 'Best Value',
    features: [
      '⭐ Featured badge & homepage placement',
      'Unlimited RFQ access with priority routing',
      'Sidebar CTA on knowledge base articles',
      'Monthly performance report',
      'All Standard features included',
      'Highlighted in directory listings',
    ],
    cta: 'Get Featured',
    ctaHref: '/login?redirect=/vendor/onboard?tier=featured',
    ctaStyle: 'btn-primary',
  },
  {
    name: 'Enterprise',
    price_inr: 'Custom',
    price_usd: 'Custom',
    period: '',
    highlight: false,
    badge: null,
    features: [
      'Custom partnership package',
      'Dedicated account manager',
      'Content sponsorship opportunities',
      'Virtual summit speaker slots',
      'Market intelligence reports',
      'White-glove onboarding & support',
    ],
    cta: 'Contact Us',
    ctaHref: 'mailto:info@hoistmarket.com',
    ctaStyle: 'btn-outline',
  },
]

const AD_PLACEMENTS = [
  {
    name: 'Homepage Banner',
    placement: 'homepage_banner',
    price_inr: '₹18,000/month',
    price_usd: '$216/month',
    reach: '~2,000 professionals/month',
    desc: 'Full-width sponsored banner on the homepage, visible to all visitors. Includes headline, description, and CTA button.',
    dimensions: '1200×120px',
    icon: '🏠',
  },
  {
    name: 'Knowledge Base Sidebar',
    placement: 'kb_sidebar',
    price_inr: '₹8,500/month',
    price_usd: '$102/month',
    reach: '~1,200 professionals/month',
    desc: 'Sticky widget in the right sidebar of all knowledge base articles. High engagement — readers are actively researching.',
    dimensions: '300×250px',
    icon: '📚',
  },
  {
    name: 'Directory Featured Slot',
    placement: 'directory_featured',
    price_inr: '₹12,000/month',
    price_usd: '$144/month',
    reach: '~800 qualified buyers/month',
    desc: 'Premium placement at the top of directory search results with sponsored badge. Directly visible to buyers actively sourcing vendors.',
    dimensions: 'Full listing card',
    icon: '🏢',
  },
  {
    name: 'Article Inline CTA',
    placement: 'article_inline',
    price_inr: '₹5,000/month',
    price_usd: '$60/month',
    reach: 'Per article (~300–500 reads/month)',
    desc: 'Inline sponsored block within selected knowledge base articles. Contextually matched to article content for highest relevance.',
    dimensions: 'Full-width block',
    icon: '📄',
  },
]

export default function AdvertisePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <div className="bg-navy-950 pt-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-3">Vendor Memberships & Advertising</div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Reach Lifting Professionals<br/>
              <span className="text-orange-500">Across India, GCC & West Africa</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              HoistMarket's audience is EPC project managers, plant heads, and procurement leads 
              actively sourcing lifting equipment. Get your company in front of the decision-makers.
            </p>
          </div>
        </div>

        {/* AUDIENCE STATS */}
        <div className="bg-navy-900 border-b border-white/5 py-8">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { n: '5,000+', label: 'Monthly Professionals', sub: 'India, GCC, West Africa' },
                { n: '60%', label: 'Procurement/Engineering Roles', sub: 'EPC managers, plant heads' },
                { n: '₹0', label: 'Vendor Bias', sub: 'Editorial independence' },
                { n: '95+', label: 'PageSpeed Score Target', sub: 'Fast on all connections' },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-3xl font-extrabold text-orange-400 mb-1">{s.n}</div>
                  <div className="text-white font-semibold text-sm mb-0.5">{s.label}</div>
                  <div className="text-slate-500 text-xs">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MEMBERSHIP TIERS */}
        <section className="py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">Vendor Directory</div>
              <h2 className="text-3xl font-bold text-navy-900 mb-3">Membership Tiers</h2>
              <p className="text-slate-500 max-w-lg mx-auto text-sm">
                List your company, receive matched RFQs, and get in front of buyers actively sourcing equipment.
                Razorpay payments — INR, USD, AED accepted.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {TIERS.map(tier => (
                <div
                  key={tier.name}
                  className={`rounded-2xl border-2 p-6 flex flex-col relative ${
                    tier.highlight
                      ? 'border-orange-500 shadow-xl shadow-orange-500/10'
                      : 'border-slate-200'
                  }`}
                >
                  {tier.badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                      tier.highlight ? 'bg-orange-500 text-white' : 'bg-slate-800 text-white'
                    }`}>
                      {tier.badge}
                    </div>
                  )}

                  <div className="mb-5">
                    <div className="font-extrabold text-navy-900 text-lg mb-1">{tier.name}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-navy-900">{tier.price_inr}</span>
                      {tier.period && <span className="text-slate-500 text-sm">{tier.period}</span>}
                    </div>
                    {tier.price_usd !== 'Custom' && tier.price_usd !== '$0' && (
                      <div className="text-xs text-slate-400 mt-0.5">{tier.price_usd}{tier.period}</div>
                    )}
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={tier.ctaHref}
                    className={`${tier.ctaStyle} w-full text-center py-2.5 text-sm font-bold rounded-lg block transition-all ${
                      tier.ctaStyle === 'btn-primary'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white'
                    }`}
                  >
                    {tier.cta}
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center text-xs text-slate-500">
              All prices + GST where applicable · Annual billing · Cancel anytime · Payments via Razorpay (INR) or Stripe (USD/AED)
            </div>
          </div>
        </section>

        {/* AD PLACEMENTS */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-500 mb-2">Advertising</div>
              <h2 className="text-3xl font-bold text-navy-900 mb-3">Sponsored Placements</h2>
              <p className="text-slate-500 max-w-lg mx-auto text-sm">
                Brand-safe advertising in a professional, vendor-neutral environment. 
                All placements are clearly labelled as sponsored.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {AD_PLACEMENTS.map(ad => (
                <div key={ad.name} className="bg-white rounded-xl border border-slate-200 p-6 hover:border-orange-200 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl flex-shrink-0">{ad.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                        <h3 className="font-bold text-navy-900">{ad.name}</h3>
                        <div className="text-right flex-shrink-0">
                          <div className="font-extrabold text-orange-600">{ad.price_inr}</div>
                          <div className="text-xs text-slate-400">{ad.price_usd}</div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-3">{ad.desc}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>📐 {ad.dimensions}</span>
                        <span>👥 {ad.reach}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-navy-900 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Advertise?</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto text-sm leading-relaxed">
                Contact us to discuss placement availability, custom packages, and sponsored content partnerships.
              </p>
              <a href="mailto:info@hoistmarket.com" className="btn-primary btn-lg inline-flex">
                <Mail className="w-5 h-5" /> Contact info@hoistmarket.com
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-navy-900 mb-8 text-center">Frequently Asked Questions</h2>
              <div className="space-y-5">
                {[
                  {
                    q: 'Is HoistMarket\'s editorial content paid for by vendors?',
                    a: 'No. All knowledge base articles, standards guides, and technical content are written and edited independently. Vendors cannot pay to influence editorial content. Sponsored placements are always clearly labelled.',
                  },
                  {
                    q: 'How are RFQs matched to vendors?',
                    a: 'HoistMarket\'s matching engine scores vendors by equipment category match, regional proximity, verification status, and membership tier. The top 2–5 matches receive the RFQ via BCC. The requester\'s contact details are shared only after a match is confirmed.',
                  },
                  {
                    q: 'What currencies do you accept?',
                    a: 'Memberships can be paid in INR via Razorpay (India), or in USD/AED via Stripe (international). Invoice-based payments are available for Enterprise tier.',
                  },
                  {
                    q: 'Can I cancel or downgrade my membership?',
                    a: 'Yes. Annual memberships can be cancelled at any time — you retain access until the end of the paid period. Monthly memberships cancel at the next billing cycle. No refunds on partial periods.',
                  },
                  {
                    q: 'How long does vendor verification take?',
                    a: 'Standard and Featured tier applicants are reviewed within 2–3 business days. We verify company registration, contact details, and equipment category claims. Verified status appears on your listing immediately after approval.',
                  },
                ].map((faq, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl p-5">
                    <h3 className="font-bold text-navy-900 text-sm mb-2">{faq.q}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
