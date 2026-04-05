import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, CheckCircle, Star, Globe, Phone, Mail,
  Calendar, Users, MessageSquare, ChevronRight, Award, ArrowLeft
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import type { Database } from '@/types/database'


export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { slug } = await params

  const supabase = await createSupabaseServer()

  const { data: vendor } = await (supabase.from('vendors') as any)
    .select('company_name, description, city, country')
    .eq('slug', slug)
    .single()

  if (!vendor) return { title: 'Vendor Not Found' }

  return {
    title: vendor.company_name,
    description: vendor.description || ''
  }
}

export const revalidate = 600

export default async function VendorProfilePage({ params }: any) {
  const { slug } = await params

  const supabase = await createSupabaseServer()

  const { data: vendor } = await (supabase.from('vendors') as any)
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!vendor) notFound()

  ;(supabase.from('vendors') as any)
    .update({ views_count: (vendor.views_count || 0) + 1 })
    .eq('id', vendor.id)

  return (
    <div>{vendor.company_name}</div>
  )
}

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: vendor.company_name,
    description: vendor.description,
    address: { '@type': 'PostalAddress', addressLocality: vendor.city, addressCountry: vendor.country },
    email: vendor.email,
    telephone: vendor.phone,
    url: vendor.website,
  }

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="pt-16">
        {/* Breadcrumb */}
        <div className="bg-navy-950 border-b border-white/5">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/directory" className="hover:text-slate-300 transition-colors">Directory</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-400">{vendor.company_name}</span>
            </nav>
          </div>
        </div>

        {/* HERO */}
        <div className="bg-navy-900 border-b border-white/5">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 overflow-hidden">
                {vendor.logo_url ? (
                  <img src={vendor.logo_url} alt={vendor.company_name} className="w-full h-full object-contain p-2" />
                ) : (
                  <span className="text-3xl font-extrabold text-navy-700">{vendor.company_name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{vendor.company_name}</h1>
                  {vendor.verified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" /> Verified Partner
                    </span>
                  )}
                  {vendor.featured && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                      <Star className="w-3.5 h-3.5 fill-current" /> Featured
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-3">
                  <MapPin className="w-4 h-4" /> {vendor.city}, {vendor.country}
                </div>
                {vendor.description && (
                  <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">{vendor.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* MAIN */}
            <div className="lg:col-span-2 space-y-6">
              {/* Equipment Categories */}
              <div className="card p-6">
                <h2 className="text-lg font-bold text-navy-900 mb-4">Equipment Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {vendor.equipment_categories?.map((cat: string) => (
                    <span key={cat} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg border border-slate-200">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              {vendor.specializations && vendor.specializations.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-navy-900 mb-4">Specializations</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {vendor.specializations.map((spec: string) => (
                      <div key={spec} className="flex items-center gap-2 text-sm text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {vendor.certifications && vendor.certifications.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-orange-500" /> Certifications & Memberships
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {vendor.certifications.map((cert: string) => (
                      <span key={cert} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg border border-blue-200">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Info */}
              <div className="card p-6">
                <h2 className="text-lg font-bold text-navy-900 mb-4">Company Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  {vendor.year_established && (
                    <div>
                      <div className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-1">Established</div>
                      <div className="font-semibold text-navy-900">{vendor.year_established}</div>
                    </div>
                  )}
                  {vendor.employee_count && (
                    <div>
                      <div className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-1">Team Size</div>
                      <div className="font-semibold text-navy-900">{vendor.employee_count}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-1">Region</div>
                    <div className="font-semibold text-navy-900">{vendor.region?.toUpperCase()}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-1">RFQs Matched</div>
                    <div className="font-semibold text-navy-900">{vendor.rfq_count || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-4">
              {/* Request Quote CTA */}
              <div className="bg-navy-900 rounded-xl p-6 text-center">
                <h3 className="text-white font-bold text-lg mb-2">Get a Quote</h3>
                <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                  Submit your requirements and receive a direct quote from {vendor.company_name}
                </p>
                <button className="btn-primary w-full justify-center py-3 mb-3">
                  <MessageSquare className="w-4 h-4" /> Request a Quote
                </button>
                <p className="text-xs text-slate-600">Your details are shared only with matched vendors</p>
              </div>

              {/* Contact Info */}
              <div className="card p-5 space-y-3">
                <h3 className="font-bold text-navy-900 text-sm">Contact</h3>
                {vendor.email && (
                  <a href={`mailto:${vendor.email}`} className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-orange-600 transition-colors">
                    <Mail className="w-4 h-4 text-slate-400" /> {vendor.email}
                  </a>
                )}
                {vendor.phone && (
                  <a href={`tel:${vendor.phone}`} className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-orange-600 transition-colors">
                    <Phone className="w-4 h-4 text-slate-400" /> {vendor.phone}
                  </a>
                )}
                {vendor.website && (
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-orange-600 transition-colors">
                    <Globe className="w-4 h-4 text-slate-400" /> Visit Website
                  </a>
                )}
              </div>

              {/* Back to directory */}
              <Link href="/directory" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Directory
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
