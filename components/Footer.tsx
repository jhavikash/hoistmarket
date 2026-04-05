import Link from 'next/link'
import { Mail, Linkedin, Globe, ArrowUpRight } from 'lucide-react'

const footerLinks = {
  Platform: [
    { label: 'Knowledge Base', href: '/knowledge-base' },
    { label: 'Vendor Directory', href: '/directory' },
    { label: 'Equipment Hub', href: '/equipment' },
    { label: 'Rental Marketplace', href: '/rentals' },
    { label: 'Industry News', href: '/news' },
  ],
  Standards: [
    { label: 'ASME B30 Guide', href: '/knowledge-base/asme-b30-vs-iso-vs-fem-lifting-standards' },
    { label: 'FEM Classification', href: '/knowledge-base/crane-duty-classification-fem-asme' },
    { label: 'LOLER Compliance', href: '/knowledge-base/loler-compliance-guide' },
    { label: 'Load Charts', href: '/knowledge-base/load-chart-reading-guide' },
    { label: 'Certification Guide', href: '/knowledge-base/nccco-cpcs-leea-certification-guide' },
  ],
  Rentals: [
    { label: 'Crawler Cranes — India', href: '/rentals/crawler-cranes-india' },
    { label: 'Mobile Cranes — UAE', href: '/rentals/mobile-cranes-uae' },
    { label: 'EOT Cranes — India', href: '/rentals/eot-cranes-india' },
    { label: 'Tower Cranes — GCC', href: '/rentals/tower-cranes-gcc' },
    { label: 'Equipment — West Africa', href: '/rentals/equipment-west-africa' },
  ],
  Company: [
    { label: 'About HoistMarket', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'List Your Company', href: '/directory/list-company' },
    { label: 'Advertise', href: '/advertise' },
    { label: 'Admin Dashboard', href: '/admin' },
  ],
}

const standards = ['ASME B30', 'FEM 1.001', 'EN 13000', 'LOLER 1998', 'DNV GL', 'ISO 4306', 'OSHA 1926.1400']

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-white/5">
      {/* Standards Bar */}
      <div className="bg-black/30 border-b border-white/5 py-3">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-600 whitespace-nowrap">
              Standards Coverage
            </span>
            <div className="flex items-center gap-4 flex-wrap">
              {standards.map(s => (
                <span key={s} className="text-xs font-semibold text-slate-500">
                  <span className="text-orange-400">{s.split(' ')[0]}</span>{' '}
                  {s.split(' ').slice(1).join(' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">HM</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Hoist<span className="text-orange-500">Market</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-5">
              The neutral B2B reference platform, vendor directory, and equipment marketplace for lifting professionals across India, GCC, and West Africa.
            </p>
            <div className="space-y-2">
              <a href="mailto:info@hoistmarket.com" className="flex items-center gap-2 text-sm text-slate-500 hover:text-orange-400 transition-colors">
                <Mail className="w-4 h-4" />
                info@hoistmarket.com
              </a>
              <a href="https://linkedin.com/company/hoistmarket" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-500 hover:text-orange-400 transition-colors">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
              <a href="https://hoistmarket.com" className="flex items-center gap-2 text-sm text-slate-500 hover:text-orange-400 transition-colors">
                <Globe className="w-4 h-4" />
                hoistmarket.com
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-600 mb-4">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-orange-400 transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Membership Tiers */}
        <div className="border-t border-white/5 pt-8 mb-8">
          <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-slate-600 mb-4">Vendor Membership Tiers</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'Free Listing', price: '₹0', features: 'Basic directory listing' },
              { name: 'Standard', price: '₹5,000/yr', features: 'Verified badge + RFQ access' },
              { name: 'Featured', price: '₹18,000/yr', features: 'Homepage + priority RFQ' },
              { name: 'Enterprise', price: 'Custom', features: 'Full partnership suite' },
            ].map(tier => (
              <div key={tier.name} className="bg-white/3 border border-white/8 rounded-lg p-3">
                <div className="text-white font-semibold text-sm mb-1">{tier.name}</div>
                <div className="text-orange-400 font-bold text-base mb-1">{tier.price}</div>
                <div className="text-slate-500 text-xs">{tier.features}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/5 pt-6">
          <p className="text-xs text-slate-600">
            © 2026 HoistMarket. Independent. Vendor-neutral. Free to access.
            Monrovia, Liberia · India · GCC · West Africa
          </p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Use', 'Editorial Policy', 'Cookie Policy'].map(item => (
              <Link key={item} href="#" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
