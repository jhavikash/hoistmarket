import Link from 'next/link'
import { MapPin, CheckCircle, Star, ExternalLink, MessageSquare } from 'lucide-react'
import type { Vendor } from '@/types/database'

interface VendorCardProps {
  vendor: Vendor
  onRequestQuote?: (vendorId: string) => void
  compact?: boolean
}

const TIER_CONFIG = {
  free: { label: 'Free', className: 'badge-free' },
  standard: { label: 'Standard', className: 'badge-standard' },
  featured: { label: 'Featured', className: 'badge-featured' },
  enterprise: { label: 'Enterprise', className: 'bg-purple-500 text-white' },
}

const REGION_LABELS: Record<string, string> = {
  india: 'India',
  gcc: 'Gulf / GCC',
  africa: 'West Africa',
  asia: 'Asia Pacific',
  europe: 'Europe',
  americas: 'Americas',
}

export default function VendorCard({ vendor, onRequestQuote, compact = false }: VendorCardProps) {
  const tier = TIER_CONFIG[vendor.tier] || TIER_CONFIG.free

  if (compact) {
    return (
      <div className="card p-4 hover:border-orange-200 transition-all duration-200 cursor-pointer group">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0 border border-slate-200">
            {vendor.logo_url ? (
              <img src={vendor.logo_url} alt={vendor.company_name} className="w-full h-full object-contain rounded-lg" />
            ) : (
              vendor.company_name.charAt(0)
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-navy-900 text-sm truncate group-hover:text-orange-600 transition-colors">
                {vendor.company_name}
              </h3>
              {vendor.verified && (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {vendor.city}, {vendor.country}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden group hover:border-orange-200 transition-all duration-200">
      {/* Featured Banner */}
      {vendor.featured && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-1.5 flex items-center gap-1.5">
          <Star className="w-3 h-3 text-white fill-white" />
          <span className="text-white text-xs font-bold tracking-wider uppercase">Featured Partner</span>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 border border-slate-100">
            {vendor.logo_url ? (
              <img src={vendor.logo_url} alt={vendor.company_name} className="w-full h-full object-contain rounded-lg p-1" />
            ) : (
              <span className="font-bold text-navy-700 text-lg">{vendor.company_name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <h3 className="font-bold text-navy-900 text-base leading-tight group-hover:text-orange-600 transition-colors">
                {vendor.company_name}
              </h3>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {vendor.verified && (
                  <span className="badge badge-verified">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
                <span className={`badge ${tier.className}`}>{tier.label}</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {vendor.city}, {vendor.country}
              <span className="text-slate-300">·</span>
              <span className="text-slate-400">{REGION_LABELS[vendor.region] || vendor.region}</span>
            </p>
          </div>
        </div>

        {/* Description */}
        {vendor.description && (
          <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
            {vendor.description}
          </p>
        )}

        {/* Equipment Categories */}
        {vendor.equipment_categories?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {vendor.equipment_categories.slice(0, 4).map((cat) => (
              <span key={cat} className="badge badge-free text-xs">
                {cat}
              </span>
            ))}
            {vendor.equipment_categories.length > 4 && (
              <span className="badge badge-free text-xs">+{vendor.equipment_categories.length - 4}</span>
            )}
          </div>
        )}

        {/* Certifications */}
        {vendor.certifications?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {vendor.certifications.slice(0, 3).map((cert) => (
              <span key={cert} className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100">
                {cert}
              </span>
            ))}
          </div>
        )}

        {/* Stats Row */}
        {(vendor.year_established || vendor.employee_count) && (
          <div className="flex items-center gap-4 py-3 border-t border-slate-100 mb-4 text-xs text-slate-500">
            {vendor.year_established && (
              <span>Est. {vendor.year_established}</span>
            )}
            {vendor.employee_count && (
              <span>{vendor.employee_count} employees</span>
            )}
            {vendor.rfq_count > 0 && (
              <span>{vendor.rfq_count} RFQs matched</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onRequestQuote?.(vendor.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded transition-all duration-150 hover:-translate-y-px"
          >
            <MessageSquare className="w-4 h-4" />
            Request Quote
          </button>
          <Link
            href={`/directory/${vendor.slug}`}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:text-slate-800 text-sm font-medium rounded transition-colors"
          >
            View
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
