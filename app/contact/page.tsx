import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Linkedin, MessageSquare, Clock, Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact HoistMarket — Get in Touch',
  description:
    'Contact HoistMarket for technical submissions, vendor directory enquiries, sponsorship opportunities, or partnership discussions.',
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="bg-navy-950 pt-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-3">Contact</div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
              Get in Touch
            </h1>
            <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
              Technical questions, vendor listing enquiries, sponsorship, or content contributions — 
              we read every message and respond to substantive enquiries within 2 business days.
            </p>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-lg font-bold text-navy-900 mb-6">Direct Contact</h2>
              <div className="space-y-4 mb-8">
                <a href="mailto:info@hoistmarket.com" className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-orange-200 transition-colors group">
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">General Enquiries</div>
                    <div className="text-sm font-semibold text-navy-900 group-hover:text-orange-600 transition-colors">info@hoistmarket.com</div>
                  </div>
                </a>
                <a href="https://linkedin.com/company/hoistmarket" target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-orange-200 transition-colors group">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Linkedin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">LinkedIn</div>
                    <div className="text-sm font-semibold text-navy-900 group-hover:text-orange-600 transition-colors">linkedin.com/company/hoistmarket</div>
                  </div>
                </a>
              </div>

              <h2 className="text-lg font-bold text-navy-900 mb-4">What We Can Help With</h2>
              <div className="space-y-3">
                {[
                  { icon: MessageSquare, label: 'Technical Content', desc: 'Submit corrections, data, or article ideas for the Knowledge Base' },
                  { icon: Shield, label: 'Vendor Listings', desc: 'Directory enquiries, tier upgrades, verification questions' },
                  { icon: Mail, label: 'Sponsorship', desc: 'Advertising rates, sponsored content, and partnership packages' },
                  { icon: Clock, label: 'RFQ Support', desc: 'Questions about submitted quotes or vendor matching' },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-slate-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-navy-900">{item.label}</div>
                      <div className="text-xs text-slate-500 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-navy-900 rounded-xl">
                <div className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">Editorial Policy</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  HoistMarket does not accept paid content placements in editorial articles. 
                  All sponsored content is clearly labelled. Content decisions are made independently.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-navy-900 px-6 py-5">
                  <h2 className="text-white font-bold text-lg">Send a Message</h2>
                  <p className="text-slate-400 text-sm mt-0.5">Responses within 2 business days</p>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
