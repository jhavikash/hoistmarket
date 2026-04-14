'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'

const contactSchema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  company: z.string().optional(),
  subject: z.enum(['Technical Correction', 'Content Submission', 'Vendor Enquiry', 'Sponsorship / Advertising', 'RFQ Support', 'General']),
  message: z.string().min(20, 'Please write at least 20 characters'),
})

type ContactData = z.infer<typeof contactSchema>

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { subject: 'General' },
  })

  const onSubmit = async (data: ContactData) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSubmitted(true)
      toast.success('Message sent successfully!')
    } catch {
      toast.error('Failed to send message. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="px-6 py-14 text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-navy-900 mb-2">Message Received</h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Thank you for reaching out. We'll respond to <strong>info@hoistmarket.com</strong> within 2 business days.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Full Name *</label>
          <input {...register('name')} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Your name" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Email *</label>
          <input {...register('email')} type="email" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="you@company.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Company / Organisation</label>
          <input {...register('company')} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Optional" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Subject *</label>
          <select {...register('subject')} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
            <option>Technical Correction</option>
            <option>Content Submission</option>
            <option>Vendor Enquiry</option>
            <option>Sponsorship / Advertising</option>
            <option>RFQ Support</option>
            <option>General</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Message *</label>
        <textarea
          {...register('message')}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y min-h-[120px]"
          placeholder="Please be as specific as possible — it helps us respond faster and more usefully."
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors"
      >
        {isSubmitting
          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><Send className="w-4 h-4" /> Send Message</>}
      </button>
    </form>
  )
}
