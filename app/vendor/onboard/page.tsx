'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Building2, Globe, Phone, Mail, Tag, Award, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const vendorSchema = z.object({
  company_name: z.string().min(2, 'Company name required'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().min(50, 'Please write at least 50 characters about your company').max(500),
  country: z.string().min(1, 'Country required'),
  city: z.string().min(1, 'City required'),
  region: z.enum(['india', 'gcc', 'africa', 'asia', 'europe', 'americas']),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  year_established: z.number().min(1900).max(2026).optional(),
  employee_count: z.string().optional(),
})

type VendorFormData = z.infer<typeof vendorSchema>

const EQUIPMENT_OPTIONS = [
  'EOT Crane', 'Gantry Crane', 'Jib Crane', 'Mobile Crane', 'All-Terrain Crane',
  'Rough Terrain Crane', 'Crawler Crane', 'Tower Crane', 'Wire Rope Hoist',
  'Electric Chain Hoist', 'Air Hoist', 'Winch', 'Rigging Gear', 'Wire Rope Slings',
  'Chain Slings', 'Shackles', 'Spreader Beams', 'Below-Hook Devices',
  'Material Handling', 'Conveyors', 'Stackers', 'Offshore Crane', 'Port Equipment',
  'Load Testing', 'NDT Services', 'Crane Maintenance', 'Spare Parts',
]

const CERT_OPTIONS = [
  'ISO 9001', 'ISO 14001', 'ISO 45001', 'LEEA', 'NCCCO', 'CPCS', 'OPITO',
  'BIS / IS Certified', 'CE Marked', 'ASME Certified', 'ATEX', 'DNV GL',
  'Bureau Veritas', 'Lloyd\'s Register', 'ABS', 'NABH',
]

const REGION_LABELS: Record<string, string> = {
  india: 'India',
  gcc: 'Gulf / GCC (UAE, Saudi Arabia, Qatar, Kuwait, Oman, Bahrain)',
  africa: 'West & East Africa',
  asia: 'Asia Pacific (excl. India)',
  europe: 'Europe',
  americas: 'Americas',
}

export default function VendorOnboardPage() {
  const [step, setStep] = useState(1)
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [selectedCerts, setSelectedCerts] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, watch, trigger, setValue, formState: { errors, isSubmitting } } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { region: 'india' },
  })

  // Auto-generate slug from company name
  const companyName = watch('company_name')
  const autoSlug = companyName?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || ''

  const nextStep = async () => {
    const fieldsToValidate = step === 1
      ? ['company_name', 'slug', 'description', 'country', 'city', 'region'] as const
      : ['email'] as const
    const valid = await trigger(fieldsToValidate)
    if (valid) setStep(s => s + 1)
  }

  const onSubmit = async (data: VendorFormData) => {
    if (selectedCats.length === 0) {
      toast.error('Please select at least one equipment category')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in first')
        router.push('/login?redirect=/vendor/onboard')
        return
      }

      const { error } = await supabase.from('vendors').insert({
        profile_id: user.id,
        company_name: data.company_name,
        slug: data.slug || autoSlug,
        description: data.description,
        country: data.country,
        city: data.city,
        region: data.region,
        email: data.email,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        website: data.website || null,
        year_established: data.year_established || null,
        employee_count: data.employee_count || null,
        equipment_categories: selectedCats,
        certifications: selectedCerts,
        tier: 'free',
        verified: false,
        featured: false,
        is_active: true,
      } as any)

      if (error) {
        if (error.code === '23505') {
          toast.error('A vendor with this slug already exists. Please choose a different URL.')
        } else {
          throw error
        }
        return
      }

      // Update profile role to vendor
      await supabase.from('profiles').update({ role: 'vendor' } as any).eq('id', user.id)

      setIsSubmitted(true)
      toast.success('Vendor listing submitted for review!')
    } catch (err: any) {
      toast.error(err.message || 'Submission failed. Please try again.')
    }
  }

  const toggleCat = (cat: string) => {
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  const toggleCert = (cert: string) => {
    setSelectedCerts(prev => prev.includes(cert) ? prev.filter(c => c !== cert) : [...prev, cert])
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {isSubmitted ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-navy-900 mb-2">Listing Submitted!</h2>
              <p className="text-slate-600 mb-6">
                Your vendor listing is under review. We'll verify your details and activate your listing within 2–3 business days. 
                You'll receive a confirmation at your registered email.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-left text-sm text-orange-700">
                <strong>Next steps:</strong>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>We verify your company registration and contact details</li>
                  <li>Once approved, your listing goes live with a Verified badge</li>
                  <li>Upgrade to Standard or Featured to receive matched RFQs</li>
                </ul>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/directory" className="btn-primary">View Directory →</Link>
                <Link href="/advertise" className="btn-outline">Upgrade Membership</Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="bg-navy-900 px-7 py-6">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-orange-400" />
                  <h1 className="text-white font-bold text-lg">List Your Company</h1>
                </div>
                <p className="text-slate-400 text-sm">Free listing · No credit card required · Upgrade anytime</p>
                {/* Step indicator */}
                <div className="flex items-center gap-2 mt-4">
                  {['Company Details', 'Contact & Web', 'Categories'].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all ${
                        i + 1 < step ? 'bg-green-500 text-white'
                        : i + 1 === step ? 'bg-orange-500 text-white'
                        : 'bg-white/20 text-white/50'
                      }`}>
                        {i + 1 < step ? '✓' : i + 1}
                      </div>
                      <span className={`text-xs hidden sm:block ${i + 1 === step ? 'text-white' : 'text-white/40'}`}>{s}</span>
                      {i < 2 && <ChevronRight className="w-3 h-3 text-white/30" />}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="p-7 space-y-4">
                  {/* Step 1 */}
                  {step === 1 && (
                    <>
                      <div>
                        <label className="label">Company Name *</label>
                        <input {...register('company_name')} className="input" placeholder="Your company name" />
                        {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>}
                      </div>
                      <div>
                        <label className="label">Profile URL (Slug) *</label>
                        <div className="flex items-center">
                          <span className="px-3 py-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l text-xs text-slate-500 whitespace-nowrap">
                            hoistmarket.com/directory/
                          </span>
                          <input
                            {...register('slug')}
                            className="input rounded-l-none border-l-0 flex-1"
                            placeholder={autoSlug || 'your-company-name'}
                            onFocus={() => { if (!watch('slug') && autoSlug) setValue('slug', autoSlug) }}
                          />
                        </div>
                        {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
                      </div>
                      <div>
                        <label className="label">Company Description * <span className="normal-case text-slate-400 font-normal">(50–500 characters)</span></label>
                        <textarea
                          {...register('description')}
                          className="input min-h-[100px] resize-y"
                          placeholder="Describe your company, key equipment types, years of experience, primary markets served..."
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Country *</label>
                          <input {...register('country')} className="input" placeholder="e.g. India, UAE, Nigeria" />
                          {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                        </div>
                        <div>
                          <label className="label">City *</label>
                          <input {...register('city')} className="input" placeholder="e.g. Mumbai, Dubai, Lagos" />
                          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="label">Primary Region *</label>
                        <select {...register('region')} className="input">
                          {Object.entries(REGION_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Year Established</label>
                          <input {...register('year_established', { valueAsNumber: true })} type="number" className="input" placeholder="e.g. 2005" />
                        </div>
                        <div>
                          <label className="label">Team Size</label>
                          <select {...register('employee_count')} className="input">
                            <option value="">Select...</option>
                            <option value="1-10">1–10</option>
                            <option value="11-50">11–50</option>
                            <option value="51-200">51–200</option>
                            <option value="201-500">201–500</option>
                            <option value="500+">500+</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <>
                      <div>
                        <label className="label">Business Email *</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input {...register('email')} type="email" className="input pl-10" placeholder="sales@yourcompany.com" />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input {...register('phone')} className="input pl-10" placeholder="+91 / +971..." />
                          </div>
                        </div>
                        <div>
                          <label className="label">WhatsApp</label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input {...register('whatsapp')} className="input pl-10" placeholder="+91 / +971..." />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="label">Website URL</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input {...register('website')} type="url" className="input pl-10" placeholder="https://yourcompany.com" />
                        </div>
                        {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
                      </div>
                      <div>
                        <label className="label flex items-center gap-2">
                          <Award className="w-3.5 h-3.5" /> Certifications & Memberships
                          <span className="normal-case text-slate-400 font-normal text-xs">(select all that apply)</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {CERT_OPTIONS.map(cert => (
                            <button
                              key={cert}
                              type="button"
                              onClick={() => toggleCert(cert)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                                selectedCerts.includes(cert)
                                  ? 'bg-blue-500 text-white border-blue-500'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                              }`}
                            >
                              {cert}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                    <>
                      <div>
                        <label className="label flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5" /> Equipment Categories *
                          <span className="normal-case text-slate-400 font-normal text-xs">(select all that apply)</span>
                        </label>
                        {selectedCats.length === 0 && (
                          <p className="text-orange-500 text-xs mt-1 mb-2">Please select at least one category</p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {EQUIPMENT_OPTIONS.map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => toggleCat(cat)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                                selectedCats.includes(cat)
                                  ? 'bg-orange-500 text-white border-orange-500'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                        {selectedCats.length > 0 && (
                          <p className="text-xs text-slate-500 mt-2">{selectedCats.length} selected</p>
                        )}
                      </div>

                      {/* Review Summary */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Listing Preview</p>
                        <div className="space-y-1.5 text-sm">
                          <div><span className="text-slate-500">Company:</span> <span className="font-semibold text-navy-900">{watch('company_name')}</span></div>
                          <div><span className="text-slate-500">Location:</span> <span className="font-semibold text-navy-900">{watch('city')}, {watch('country')}</span></div>
                          <div><span className="text-slate-500">Tier:</span> <span className="font-semibold text-orange-500">Free (upgrade available)</span></div>
                          <div><span className="text-slate-500">Categories:</span> <span className="font-semibold text-navy-900">{selectedCats.slice(0, 3).join(', ')}{selectedCats.length > 3 ? ` +${selectedCats.length - 3}` : ''}</span></div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="px-7 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="text-xs text-slate-400">Step {step} of 3</div>
                  <div className="flex gap-3">
                    {step > 1 && (
                      <button type="button" onClick={() => setStep(s => s - 1)} className="px-4 py-2 border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-white">
                        Back
                      </button>
                    )}
                    {step < 3 ? (
                      <button type="button" onClick={nextStep} className="btn-primary btn-sm">Continue →</button>
                    ) : (
                      <button type="submit" disabled={isSubmitting || selectedCats.length === 0} className="btn-primary btn-sm disabled:opacity-60 disabled:cursor-not-allowed">
                        {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Listing →'}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
