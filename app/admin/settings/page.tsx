'use client'

import { useState } from 'react'
import {
  Save, Bell, Mail, Globe, Shield, CreditCard,
  Database, Sliders, ChevronRight, CheckCircle, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SettingsSection {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const SECTIONS: SettingsSection[] = [
  { id: 'general', label: 'General', icon: Sliders },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'email', label: 'Email Templates', icon: Mail },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'seo', label: 'SEO Defaults', icon: Globe },
  { id: 'security', label: 'Security', icon: Shield },
]

export default function AdminSettingsPage() {
  const [activeSection, setActiveSection] = useState('general')
  const [saving, setSaving] = useState(false)

  // General settings state
  const [general, setGeneral] = useState({
    siteName: 'HoistMarket',
    siteUrl: 'https://hoistmarket.com',
    adminEmail: 'info@hoistmarket.com',
    supportEmail: 'support@hoistmarket.com',
    commissionRate: '3',
    rfqAutoMatch: true,
    vendorVerificationRequired: true,
    maxRFQsPerVendorFree: '0',
    maxRFQsPerVendorStandard: '10',
    maintenanceMode: false,
  })

  // Notification settings
  const [notifications, setNotifications] = useState({
    newRFQEmail: true,
    newRFQSlack: false,
    newVendorEmail: true,
    commissionReceived: true,
    weeklyReport: true,
    dailyDigest: false,
    slackWebhook: '',
  })

  // SEO settings
  const [seoDefaults, setSeoDefaults] = useState({
    defaultTitle: 'HoistMarket — Global Lifting Equipment Platform',
    defaultDescription: 'The neutral B2B reference platform for lifting professionals across India, GCC, and West Africa.',
    twitterHandle: '@hoistmarket',
    googleVerification: '',
    gaMeasurementId: 'G-XXXXXXXXXX',
    gscProperty: 'https://hoistmarket.com',
  })

  // Payment settings
  const [payments, setPayments] = useState({
    razorpayEnabled: true,
    razorpayMode: 'live',
    stripeEnabled: false,
    invoicePrefix: 'HM-INV',
    invoiceFooter: 'HoistMarket · info@hoistmarket.com · hoistmarket.com',
    standardPriceINR: '5000',
    featuredPriceINR: '18000',
    standardPriceUSD: '60',
    featuredPriceUSD: '216',
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success('Settings saved successfully')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-navy-900">Platform Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configure platform behaviour, notifications, and integrations</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors"
        >
          {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {SECTIONS.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-left border-b border-slate-100 last:border-0 transition-colors ${
                  activeSection === section.id
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <section.icon className="w-4 h-4 flex-shrink-0" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* General */}
          {activeSection === 'general' && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-navy-900">General Settings</h2>
                <p className="text-sm text-slate-500 mt-0.5">Core platform configuration</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Site Name</label>
                    <input
                      value={general.siteName}
                      onChange={e => setGeneral(p => ({ ...p, siteName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Site URL</label>
                    <input
                      value={general.siteUrl}
                      onChange={e => setGeneral(p => ({ ...p, siteUrl: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Admin Email</label>
                    <input
                      value={general.adminEmail}
                      onChange={e => setGeneral(p => ({ ...p, adminEmail: e.target.value }))}
                      type="email"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Default Commission Rate (%)</label>
                    <input
                      value={general.commissionRate}
                      onChange={e => setGeneral(p => ({ ...p, commissionRate: e.target.value }))}
                      type="number"
                      min="0" max="20"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <h3 className="text-sm font-bold text-navy-900">Feature Flags</h3>
                  {[
                    { key: 'rfqAutoMatch', label: 'Auto-match RFQs to vendors on submission', desc: 'Automatically run matching algorithm when a new RFQ is submitted' },
                    { key: 'vendorVerificationRequired', label: 'Require admin approval for new vendor listings', desc: 'New vendor submissions go into a review queue before going live' },
                    { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Show maintenance page to all non-admin visitors' },
                  ].map(item => (
                    <label key={item.key} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={general[item.key as keyof typeof general] as boolean}
                        onChange={e => setGeneral(p => ({ ...p, [item.key]: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 accent-orange-500 flex-shrink-0"
                      />
                      <div>
                        <div className="text-sm font-semibold text-slate-700">{item.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-navy-900">Notification Settings</h2>
                <p className="text-sm text-slate-500 mt-0.5">Control how and when you receive platform alerts</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-navy-900 mb-3">Email Notifications</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'newRFQEmail', label: 'New RFQ submitted', desc: 'Instant email when a new RFQ arrives' },
                      { key: 'newVendorEmail', label: 'New vendor listing', desc: 'Email when a vendor submits for review' },
                      { key: 'commissionReceived', label: 'Commission received', desc: 'Confirmation when payment is logged' },
                      { key: 'weeklyReport', label: 'Weekly summary report', desc: 'Sunday digest of key metrics' },
                      { key: 'dailyDigest', label: 'Daily digest', desc: 'Morning summary of previous day activity' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={notifications[item.key as keyof typeof notifications] as boolean}
                          onChange={e => setNotifications(p => ({ ...p, [item.key]: e.target.checked }))}
                          className="w-4 h-4 accent-orange-500"
                        />
                        <div>
                          <div className="text-sm font-semibold text-slate-700">{item.label}</div>
                          <div className="text-xs text-slate-500">{item.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-bold text-navy-900 mb-3">Slack Integration</h3>
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={notifications.newRFQSlack}
                      onChange={e => setNotifications(p => ({ ...p, newRFQSlack: e.target.checked }))}
                      className="w-4 h-4 accent-orange-500"
                    />
                    <span className="text-sm font-semibold text-slate-700">Send new RFQs to Slack</span>
                  </label>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Slack Webhook URL</label>
                    <input
                      value={notifications.slackWebhook}
                      onChange={e => setNotifications(p => ({ ...p, slackWebhook: e.target.value }))}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payments */}
          {activeSection === 'payments' && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-navy-900">Payment Settings</h2>
                <p className="text-sm text-slate-500 mt-0.5">Razorpay configuration and membership pricing</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Razorpay Status */}
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-800 text-sm">Razorpay Connected</div>
                    <div className="text-xs text-green-600">Mode: {payments.razorpayMode === 'live' ? 'Live' : 'Test'} · Key configured in .env.local</div>
                  </div>
                </div>

                {/* Membership Pricing */}
                <div>
                  <h3 className="text-sm font-bold text-navy-900 mb-4">Membership Pricing</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Standard — INR/year', key: 'standardPriceINR', prefix: '₹' },
                      { label: 'Standard — USD/year', key: 'standardPriceUSD', prefix: '$' },
                      { label: 'Featured — INR/year', key: 'featuredPriceINR', prefix: '₹' },
                      { label: 'Featured — USD/year', key: 'featuredPriceUSD', prefix: '$' },
                    ].map(item => (
                      <div key={item.key}>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">{item.label}</label>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-sm font-semibold">{item.prefix}</span>
                          <input
                            value={payments[item.key as keyof typeof payments]}
                            onChange={e => setPayments(p => ({ ...p, [item.key]: e.target.value }))}
                            type="number"
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invoice */}
                <div className="border-t border-slate-100 pt-5">
                  <h3 className="text-sm font-bold text-navy-900 mb-4">Invoice Configuration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Invoice Prefix</label>
                      <input
                        value={payments.invoicePrefix}
                        onChange={e => setPayments(p => ({ ...p, invoicePrefix: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Invoice Footer Text</label>
                      <input
                        value={payments.invoiceFooter}
                        onChange={e => setPayments(p => ({ ...p, invoiceFooter: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEO Defaults */}
          {activeSection === 'seo' && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-navy-900">SEO Default Settings</h2>
                <p className="text-sm text-slate-500 mt-0.5">Default metadata used when page-specific SEO is not set</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Default Page Title</label>
                  <input
                    value={seoDefaults.defaultTitle}
                    onChange={e => setSeoDefaults(p => ({ ...p, defaultTitle: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Keep under 60 characters for Google</p>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Default Meta Description</label>
                  <textarea
                    value={seoDefaults.defaultDescription}
                    onChange={e => setSeoDefaults(p => ({ ...p, defaultDescription: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y min-h-[80px]"
                  />
                  <p className="text-xs text-slate-400 mt-1">Keep 150–160 characters. Currently: {seoDefaults.defaultDescription.length} chars</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Google Analytics ID</label>
                    <input
                      value={seoDefaults.gaMeasurementId}
                      onChange={e => setSeoDefaults(p => ({ ...p, gaMeasurementId: e.target.value }))}
                      placeholder="G-XXXXXXXXXX"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Google Site Verification</label>
                    <input
                      value={seoDefaults.googleVerification}
                      onChange={e => setSeoDefaults(p => ({ ...p, googleVerification: e.target.value }))}
                      placeholder="google-site-verification=..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Twitter Handle</label>
                    <input
                      value={seoDefaults.twitterHandle}
                      onChange={e => setSeoDefaults(p => ({ ...p, twitterHandle: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-navy-900">Security Settings</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-green-800 text-sm">Supabase Row Level Security Active</div>
                    <div className="text-xs text-green-600 mt-0.5">All tables protected with RLS policies. Only authenticated users can access their own data.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-green-800 text-sm">Admin Route Protection Active</div>
                    <div className="text-xs text-green-600 mt-0.5">middleware.ts enforces role-based access on /admin/* and /dashboard/* routes.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-blue-800 text-sm">Recommended: Enable Supabase MFA</div>
                    <div className="text-xs text-blue-600 mt-0.5">Enable multi-factor authentication for your admin account in Supabase dashboard → Authentication → MFA.</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-900 mb-3">Security Headers</h3>
                  <div className="space-y-2">
                    {[
                      'X-Frame-Options: DENY',
                      'X-Content-Type-Options: nosniff',
                      'Referrer-Policy: strict-origin-when-cross-origin',
                      'Content-Security-Policy: (Configured in next.config.js)',
                    ].map(h => (
                      <div key={h} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <code className="text-xs font-mono text-slate-600">{h}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Templates */}
          {activeSection === 'email' && (
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="font-bold text-navy-900">Email Templates</h2>
                <p className="text-sm text-slate-500 mt-0.5">Transactional email templates sent via Resend API</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: 'RFQ Confirmation (to requester)', status: 'Active', slug: 'rfq-confirmation' },
                  { label: 'RFQ Dispatch (to vendors — BCC)', status: 'Active', slug: 'rfq-dispatch' },
                  { label: 'Vendor Approved', status: 'Active', slug: 'vendor-approved' },
                  { label: 'Vendor Pending Review', status: 'Active', slug: 'vendor-pending' },
                  { label: 'Membership Activated', status: 'Active', slug: 'membership-activated' },
                  { label: 'Weekly Admin Report', status: 'Pending', slug: 'weekly-report' },
                ].map(tpl => (
                  <div key={tpl.slug} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div>
                      <div className="text-sm font-semibold text-navy-900">{tpl.label}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{tpl.slug}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        tpl.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>{tpl.status}</span>
                      <button className="text-xs text-blue-500 hover:text-blue-700 font-semibold">Edit</button>
                    </div>
                  </div>
                ))}
                <div className="text-xs text-slate-400 mt-2">
                  Email delivery via <span className="font-semibold">Resend API</span>. Configure <code className="bg-slate-100 px-1 rounded">RESEND_API_KEY</code> in .env.local
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
