'use client'

import { useState, useEffect } from 'react'
import { X, Send, Zap, CheckCircle, AlertCircle, ChevronRight, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const schema = z.object({
  requester_name:    z.string().min(2, 'Name required'),
  requester_email:   z.string().email('Valid email required'),
  requester_company: z.string().optional(),
  requester_phone:   z.string().optional(),
  equipment_category: z.string().min(1, 'Select a category'),
  required_capacity:  z.string().optional(),
  capacity_unit: z.enum(['tonnes','kg','lbs']).default('tonnes'),
  span_required: z.string().optional(),
  lift_height:   z.string().optional(),
  duty_class:    z.string().optional(),
  site_region:   z.string().min(1, 'Select a region'),
  site_country:  z.string().optional(),
  rental_duration: z.string().optional(),
  project_description: z.string().optional(),
  budget_range:  z.string().optional(),
  special_requirements: z.string().optional(),
  urgency: z.enum(['low','medium','high','urgent']).default('medium'),
})

type FormData = z.infer<typeof schema>

const CATS = [
  'EOT / Overhead Crane','Mobile Crane — All-Terrain','Mobile Crane — Rough Terrain',
  'Crawler Crane','Tower Crane','Wire Rope Hoist','Electric Chain Hoist',
  'Rigging & Lifting Gear','Material Handling System','Offshore / Marine Crane','Other',
]
const REGIONS = [
  'India — Mumbai','India — Delhi NCR','India — Chennai','India — Gujarat','India — Other',
  'UAE / Dubai','Saudi Arabia','Qatar','Kuwait / Bahrain / Oman',
  'Nigeria / Lagos','Ghana','Liberia','Other West Africa',
  'Southeast Asia','Europe','Other',
]

interface Props { onClose: () => void; initialCategory?: string }

export default function RfqForm({ onClose, initialCategory }: Props) {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [rfqNumber, setRfqNumber] = useState('')
  const [matchedCount, setMatchedCount] = useState(0)

  const {
    register, handleSubmit, trigger, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      equipment_category: initialCategory ?? '',
      capacity_unit: 'tonnes',
      urgency: 'medium',
    },
  })

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onEsc)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onEsc) }
  }, [onClose])

  const next = async () => {
    const fields = step === 1
      ? ['requester_name','requester_email','equipment_category','site_region'] as const
      : []
    if (await trigger(fields)) setStep(s => s + 1)
  }

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Submission failed. Please try again.')
      setRfqNumber(json.rfq_number)
      setMatchedCount(json.matched_vendors ?? 0)
      setSubmitted(true)
      toast.success('RFQ submitted successfully!')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const inputCls = (err?: { message?: string }) =>
    `w-full px-3.5 py-2.5 border ${err ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors placeholder:text-slate-400`

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-navy-950/85 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-xl bg-white sm:rounded-2xl shadow-2xl flex flex-col max-h-screen sm:max-h-[92vh] overflow-hidden">

        {/* Header */}
        <div className="bg-navy-900 px-5 py-4 flex items-center justify-between flex-shrink-0 sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm leading-none">Request a Quote</h2>
              <p className="text-slate-400 text-xs mt-0.5">Equipment Rental / Purchase · {step}/3</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1">
              {[1,2,3].map(s => (
                <div key={s} className={`h-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-orange-500 w-7' : 'bg-white/20 w-3'}`} />
              ))}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {submitted ? (
            /* Success screen */
            <div className="px-6 py-10 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-1">RFQ Submitted!</h3>
              <p className="text-slate-500 text-sm mb-4">Your reference number:</p>
              <div className="inline-block bg-navy-900 text-orange-400 font-mono font-bold text-lg px-5 py-3 rounded-xl mb-5">
                {rfqNumber}
              </div>

              {matchedCount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="font-semibold text-green-800 text-sm">
                      {matchedCount} vendor{matchedCount > 1 ? 's' : ''} auto-matched
                    </span>
                  </div>
                  <p className="text-green-700 text-xs leading-relaxed">
                    Our matching engine found {matchedCount} verified vendor{matchedCount > 1 ? 's' : ''} for your requirements.
                    An admin will review and dispatch within 24 hours.
                  </p>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <ul className="text-xs text-slate-600 space-y-1">
                    <li>• HoistMarket reviews and forwards to matched vendors</li>
                    <li>• Vendor contacts stay private until match is confirmed</li>
                    <li>• You receive 2–5 competitive quotes within 48–72 hours</li>
                  </ul>
                </div>
              </div>

              <button onClick={onClose} className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="px-5 py-5 space-y-4">

                {/* Step 1 */}
                {step === 1 && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                      Contact Details &amp; Equipment
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name *</label>
                        <input {...register('requester_name')} className={inputCls(errors.requester_name)} placeholder="Your name" autoComplete="name" />
                        {errors.requester_name && <p className="text-red-500 text-xs mt-1">{errors.requester_name.message}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Company</label>
                        <input {...register('requester_company')} className={inputCls()} placeholder="EPC firm" autoComplete="organization" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Email *</label>
                        <input {...register('requester_email')} type="email" className={inputCls(errors.requester_email)} placeholder="you@company.com" autoComplete="email" />
                        {errors.requester_email && <p className="text-red-500 text-xs mt-1">{errors.requester_email.message}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Phone / WhatsApp</label>
                        <input {...register('requester_phone')} className={inputCls()} placeholder="+91 / +971…" autoComplete="tel" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Equipment Category *</label>
                        <select {...register('equipment_category')} className={inputCls(errors.equipment_category)}>
                          <option value="">Select…</option>
                          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {errors.equipment_category && <p className="text-red-500 text-xs mt-1">{errors.equipment_category.message}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Site Region *</label>
                        <select {...register('site_region')} className={inputCls(errors.site_region)}>
                          <option value="">Select…</option>
                          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        {errors.site_region && <p className="text-red-500 text-xs mt-1">{errors.site_region.message}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                      Technical Specifications
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Required Capacity</label>
                        <input {...register('required_capacity')} className={inputCls()} placeholder="e.g. 50" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Unit</label>
                        <select {...register('capacity_unit')} className={inputCls()}>
                          <option value="tonnes">Tonnes</option>
                          <option value="kg">kg</option>
                          <option value="lbs">lbs</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Span Required</label>
                        <input {...register('span_required')} className={inputCls()} placeholder="e.g. 18m" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Lift Height</label>
                        <input {...register('lift_height')} className={inputCls()} placeholder="e.g. 12m" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Duty Class (FEM/ASME)</label>
                        <select {...register('duty_class')} className={inputCls()}>
                          <option value="">Not known</option>
                          <option>FEM A1</option><option>FEM A3</option>
                          <option>FEM A5</option><option>FEM A7</option>
                          <option>ASME Service</option><option>ASME Standard</option>
                          <option>ASME Heavy</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Rental Duration</label>
                        <input {...register('rental_duration')} className={inputCls()} placeholder="e.g. 3 months" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Site / Country Details</label>
                      <input {...register('site_country')} className={inputCls()} placeholder="e.g. Steel plant, port, Mumbai…" />
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                      Project Details
                    </p>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Project Description</label>
                      <textarea {...register('project_description')} rows={3}
                        className={`${inputCls()} resize-none`}
                        placeholder="Describe lift requirements, site conditions, access constraints…" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Budget Range</label>
                        <select {...register('budget_range')} className={inputCls()}>
                          <option value="">Prefer not to say</option>
                          <option value="under_5L">Under ₹5L / $6K</option>
                          <option value="5L_25L">₹5L–25L / $6K–30K</option>
                          <option value="25L_1Cr">₹25L–1Cr / $30K–120K</option>
                          <option value="above_1Cr">Above ₹1Cr / $120K+</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Urgency</label>
                        <select {...register('urgency')} className={inputCls()}>
                          <option value="low">Low — Flexible</option>
                          <option value="medium">Medium — 30 days</option>
                          <option value="high">High — 2 weeks</option>
                          <option value="urgent">Urgent — 48 hours</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Special Requirements</label>
                      <textarea {...register('special_requirements')} rows={2}
                        className={`${inputCls()} resize-none`}
                        placeholder="ATEX zones, load testing, certifications required…" />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-500 leading-relaxed">
                      🔒 Your details are never shared without your consent. HoistMarket acts as a neutral broker — commission only on completed deals.
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-shrink-0 sm:rounded-b-2xl">
                <span className="text-xs text-slate-400">Step {step} of 3</span>
                <div className="flex items-center gap-2">
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(s => s - 1)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors">
                      ← Back
                    </button>
                  )}
                  {step < 3 ? (
                    <button type="button" onClick={next}
                      className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors">
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="submit" disabled={isSubmitting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors">
                      {isSubmitting
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                        : <><Send className="w-4 h-4" /> Submit RFQ</>}
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
