'use client'

import { useState, useCallback, useTransition } from 'react'
import { Search, X, MapPin, CheckCircle, Star, MessageSquare, ExternalLink, Filter, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import RfqForm from '@/components/RfqForm'

type Vendor = {
  id: string; company_name: string; slug: string
  description: string | null; country: string; city: string; region: string
  equipment_categories: string[]; tier: string; verified: boolean; featured: boolean
  logo_url: string | null; certifications: string[] | null
  year_established: number | null; rfq_count: number; views_count: number
}

const REGIONS = [
  { value: '', label: 'All Regions' },
  { value: 'india', label: 'India' },
  { value: 'gcc', label: 'Gulf / GCC' },
  { value: 'africa', label: 'West Africa' },
  { value: 'asia', label: 'Asia Pacific' },
  { value: 'europe', label: 'Europe' },
]

const CATEGORIES = [
  '', 'EOT Crane', 'Mobile Crane', 'Crawler Crane', 'Tower Crane',
  'Wire Rope Hoist', 'Electric Chain Hoist', 'Rigging', 'Material Handling',
  'Offshore Crane', 'Below-Hook Devices',
]

const TIERS = [
  { value: '', label: 'All Tiers' },
  { value: 'featured', label: 'Featured' },
  { value: 'standard', label: 'Standard' },
  { value: 'free', label: 'Free' },
]

const TIER_STYLE: Record<string, string> = {
  free:       'bg-slate-100 text-slate-600 border border-slate-200',
  standard:   'bg-blue-50 text-blue-700 border border-blue-200',
  featured:   'bg-orange-500 text-white',
  enterprise: 'bg-purple-500 text-white',
}

interface Props { initialVendors: Vendor[] }

export default function DirectoryClient({ initialVendors }: Props) {
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors)
  const [total, setTotal]     = useState(initialVendors.length)
  const [search, setSearch]   = useState('')
  const [region, setRegion]   = useState('')
  const [category, setCategory] = useState('')
  const [tier, setTier]       = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [rfqTarget, setRfqTarget] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Live search via API — debounced on input
  const fetchVendors = useCallback(async (
    s: string, r: string, c: string, t: string, v: boolean
  ) => {
    const params = new URLSearchParams()
    if (s) params.set('search', s)
    if (r) params.set('region', r)
    if (c) params.set('category', c)
    if (t) params.set('tier', t)
    if (v) params.set('verified', 'true')
    params.set('limit', '50')

    try {
      const res = await fetch(`/api/vendors?${params.toString()}`)
      if (!res.ok) return
      const data = await res.json()
      setVendors(data.vendors ?? [])
      setTotal(data.total ?? 0)
    } catch { /* keep current */ }
  }, [])

  const handleSearch = (val: string) => {
    setSearch(val)
    startTransition(() => fetchVendors(val, region, category, tier, verifiedOnly))
  }

  const handleFilter = (key: string, val: string | boolean) => {
    const next = {
      search,
      region:   key === 'region'   ? (val as string)  : region,
      category: key === 'category' ? (val as string)  : category,
      tier:     key === 'tier'     ? (val as string)  : tier,
      verified: key === 'verified' ? (val as boolean) : verifiedOnly,
    }
    if (key === 'region')   setRegion(val as string)
    if (key === 'category') setCategory(val as string)
    if (key === 'tier')     setTier(val as string)
    if (key === 'verified') setVerifiedOnly(val as boolean)
    startTransition(() => fetchVendors(next.search, next.region, next.category, next.tier, next.verified))
  }

  const clearFilters = () => {
    setSearch(''); setRegion(''); setCategory(''); setTier(''); setVerifiedOnly(false)
    startTransition(() => fetchVendors('', '', '', '', false))
  }

  const activeCount = [region, category, tier, verifiedOnly].filter(Boolean).length

  return (
    <>
      {/* Sticky filter bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search companies, equipment, city…"
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-colors"
              />
              {search && (
                <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop filters */}
            <div className="hidden md:flex items-center gap-2">
              <select value={region} onChange={e => handleFilter('region', e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer">
                {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <select value={category} onChange={e => handleFilter('category', e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer">
                <option value="">All Categories</option>
                {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={tier} onChange={e => handleFilter('tier', e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer">
                {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <label className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm cursor-pointer hover:bg-slate-100 select-none text-slate-700">
                <input type="checkbox" checked={verifiedOnly} onChange={e => handleFilter('verified', e.target.checked)} className="accent-orange-500 w-3.5 h-3.5" />
                Verified only
              </label>
            </div>

            {/* Mobile filter toggle */}
            <button onClick={() => setShowFilters(!showFilters)}
              className={`md:hidden flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${activeCount > 0 ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-slate-200 text-slate-700'}`}>
              <Filter className="w-4 h-4" />
              {activeCount > 0 && <span>{activeCount}</span>}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Clear */}
            {(search || activeCount > 0) && (
              <button onClick={clearFilters} className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Mobile expanded filters */}
          {showFilters && (
            <div className="md:hidden mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
              <select value={region} onChange={e => handleFilter('region', e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50">
                {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <select value={tier} onChange={e => handleFilter('tier', e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50">
                {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select value={category} onChange={e => handleFilter('category', e.target.value)}
                className="col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50">
                <option value="">All Categories</option>
                {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="col-span-2 flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={verifiedOnly} onChange={e => handleFilter('verified', e.target.checked)} className="accent-orange-500" />
                Show verified vendors only
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-slate-600">
            {isPending ? (
              <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> Searching...</span>
            ) : (
              <><span className="font-bold text-navy-900">{vendors.length}</span> vendor{vendors.length !== 1 ? 's' : ''} found</>
            )}
          </p>
          <a href="/vendor/onboard" className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors">
            + List Your Company
          </a>
        </div>

        {vendors.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">No vendors found</h3>
            <p className="text-slate-500 text-sm mb-5">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-0 border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {vendors.map(vendor => (
              <div key={vendor.id} className={`bg-white hover:bg-slate-50/60 transition-colors ${vendor.featured ? 'relative' : ''}`}>
                {vendor.featured && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-400" />
                )}
                <div className="p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border border-slate-200 overflow-hidden">
                      {vendor.logo_url ? (
                        <img src={vendor.logo_url} alt={vendor.company_name} className="w-full h-full object-contain p-1 rounded-xl" />
                      ) : (
                        <span className="font-extrabold text-navy-700 text-lg">{vendor.company_name.charAt(0)}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/directory/${vendor.slug}`}
                            className="font-bold text-navy-900 text-base hover:text-orange-600 transition-colors">
                            {vendor.company_name}
                          </Link>
                          {vendor.verified && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </span>
                          )}
                          {vendor.featured && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3 fill-current" /> Featured
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded ${TIER_STYLE[vendor.tier] ?? TIER_STYLE.free}`}>
                          {vendor.tier.charAt(0).toUpperCase() + vendor.tier.slice(1)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        {vendor.city}, {vendor.country}
                      </div>

                      {vendor.description && (
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-3">
                          {vendor.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {vendor.equipment_categories?.slice(0, 5).map(cat => (
                          <span key={cat} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200 font-medium">
                            {cat}
                          </span>
                        ))}
                        {(vendor.equipment_categories?.length ?? 0) > 5 && (
                          <span className="text-xs text-slate-400 py-0.5">
                            +{vendor.equipment_categories.length - 5}
                          </span>
                        )}
                      </div>

                      {vendor.certifications && vendor.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {vendor.certifications.slice(0, 4).map(cert => (
                            <span key={cert} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded font-medium">
                              {cert}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <button onClick={() => setRfqTarget(vendor.company_name)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-all hover:-translate-y-px">
                          <MessageSquare className="w-3.5 h-3.5" /> Request Quote
                        </button>
                        <Link href={`/directory/${vendor.slug}`}
                          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white text-slate-600 hover:text-slate-800 text-sm font-medium rounded-lg transition-colors">
                          View Profile <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        {vendor.rfq_count > 0 && (
                          <span className="text-xs text-slate-400 hidden sm:block">
                            {vendor.rfq_count} RFQs matched
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {rfqTarget && <RfqForm onClose={() => setRfqTarget(null)} initialCategory={rfqTarget} />}
    </>
  )
}
