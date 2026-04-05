import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, CheckCircle, Star, Globe, Phone, Mail,
  ChevronRight, Award, ArrowLeft, MessageSquare
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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

  // update views
  ;(supabase.from('vendors') as any)
    .update({ views_count: (vendor.views_count || 0) + 1 })
    .eq('id', vendor.id)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: vendor.company_name,
    description: vendor.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: vendor.city,
      addressCountry: vendor.country
    },
    email: vendor.email,
    telephone: vendor.phone,
    url: vendor.website,
  }

  return (
    <>
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="pt-16">
        {/* Breadcrumb */}
        <div className="bg-navy-950 border-b border-white/5">
          <div className="max-w-screen-xl mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-xs text-slate-500">
              <Link href="/">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/directory">Directory</Link>
              <ChevronRight className="w-3 h-3" />
              <span>{vendor.company_name}</span>
            </nav>
          </div>
        </div>

        {/* HERO */}
        <div className="bg-navy-900 border-b border-white/5">
          <div className="max-w-screen-xl mx-auto px-4 py-10">
            <h1 className="text-3xl text-white font-bold">
              {vendor.company_name}
            </h1>

            <p className="text-slate-400 mt-2">
              {vendor.city}, {vendor.country}
            </p>

            {vendor.description && (
              <p className="text-slate-300 mt-3 max-w-2xl">
                {vendor.description}
              </p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-screen-xl mx-auto px-4 py-10">
          <button className="btn-primary flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Request a Quote
          </button>
        </div>

        <Link href="/directory" className="block px-4 pb-10 text-sm text-slate-500">
          <ArrowLeft className="w-4 h-4 inline" /> Back to Directory
        </Link>
      </main>

      <Footer />
    </>
  )
}
