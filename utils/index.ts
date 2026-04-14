// ──────────────────────────────────────────────────────────────────────────────
// HoistMarket Utility Functions
// ──────────────────────────────────────────────────────────────────────────────

// ── FORMATTING ───────────────────────────────────────────────────────────────

/**
 * Format INR currency with Indian number system (lakhs, crores)
 */
export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount.toLocaleString('en-IN')}`
}

/**
 * Format USD currency
 */
export function formatUSD(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`
  return `$${amount.toFixed(2)}`
}

/**
 * Format a date as "Mar 24, 2026"
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format a date as relative time ("3 days ago", "just now")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

/**
 * Convert string to URL-safe slug
 */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── UNIT CONVERSIONS ──────────────────────────────────────────────────────────

export const conversions = {
  metricTonsToShortTons: (t: number) => t * 1.10231,
  shortTonsToMetricTons: (t: number) => t / 1.10231,
  metricTonsToLongTons: (t: number) => t * 0.984207,
  kgToLbs: (kg: number) => kg * 2.20462,
  lbsToKg: (lbs: number) => lbs / 2.20462,
  metresToFeet: (m: number) => m * 3.28084,
  feetToMetres: (ft: number) => ft / 3.28084,
  mmToInches: (mm: number) => mm * 0.0393701,
  inchesToMm: (inches: number) => inches / 0.0393701,
  kpaToPs: (kpa: number) => kpa * 0.14504,
  mpaToPs: (mpa: number) => mpa * 145.038,
  kilonewtonsToMetricTons: (kn: number) => kn * 0.10197,
}

// ── FEM DUTY CLASSIFICATION ───────────────────────────────────────────────────

export type FEMGroup = 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8'

export interface DutyCycleResult {
  group: FEMGroup
  annualHours: number
  label: string
  description: string
  examples: string[]
}

/**
 * Estimate FEM crane duty group from operating hours/day and days/year
 */
export function calculateFEMDutyGroup(hoursPerDay: number, daysPerYear: number): DutyCycleResult {
  const annualHours = hoursPerDay * daysPerYear

  if (annualHours < 200)  return { group: 'A1', annualHours, label: 'Very Light', description: 'Occasional use only', examples: ['Workshop hoists', 'Erection cranes'] }
  if (annualHours < 800)  return { group: 'A2', annualHours, label: 'Light', description: 'Infrequent use with light loads', examples: ['Maintenance cranes', 'Storage hoists'] }
  if (annualHours < 1600) return { group: 'A3', annualHours, label: 'Moderate', description: 'Intermittent operation', examples: ['General workshop', 'Light assembly'] }
  if (annualHours < 3200) return { group: 'A4', annualHours, label: 'Medium', description: 'Regular use', examples: ['Manufacturing', 'Warehousing'] }
  if (annualHours < 6300) return { group: 'A5', annualHours, label: 'Heavy', description: 'Frequent use with medium-to-heavy loads', examples: ['Steel fabrication', 'Paper mills'] }
  if (annualHours < 12500) return { group: 'A6', annualHours, label: 'Very Heavy', description: 'Intensive operation', examples: ['Steel plants', 'Foundries'] }
  if (annualHours < 25000) return { group: 'A7', annualHours, label: 'Extra Heavy', description: 'Near-continuous operation', examples: ['Continuous casting', 'Process plants'] }
  return { group: 'A8', annualHours, label: 'Ultra Heavy', description: 'Continuous 24/7 operation', examples: ['Steel melt shops', 'Blast furnaces'] }
}

// ── RFQ SCORING ───────────────────────────────────────────────────────────────

interface VendorForScoring {
  id: string
  equipment_categories: string[]
  region: string
  tier: string
  verified: boolean
  rfq_count: number
}

interface RFQForScoring {
  equipment_category: string
  site_region: string
}

/**
 * Score a vendor's match quality for an RFQ (0–100).
 * Higher score = better match.
 */
export function scoreVendorMatch(vendor: VendorForScoring, rfq: RFQForScoring): number {
  let score = 0

  // Category match — highest weight
  const rfqCatNorm = rfq.equipment_category.toLowerCase().replace(/_/g, ' ')
  const vendorCatsNorm = vendor.equipment_categories.map(c => c.toLowerCase())

  const exactMatch = vendorCatsNorm.some(c => c === rfqCatNorm)
  const partialMatch = vendorCatsNorm.some(c =>
    c.includes(rfqCatNorm.split(' ')[0]) ||
    rfqCatNorm.includes(c.split(' ')[0])
  )

  if (exactMatch) score += 50
  else if (partialMatch) score += 30

  // Region match
  const rfqRegionNorm = rfq.site_region.toLowerCase()
  const vendorRegionNorm = vendor.region.toLowerCase()

  if (
    rfqRegionNorm.includes(vendorRegionNorm) ||
    vendorRegionNorm.includes(rfqRegionNorm.split('_')[0]) ||
    (rfqRegionNorm.includes('india') && vendorRegionNorm === 'india') ||
    (rfqRegionNorm.includes('uae') && vendorRegionNorm === 'gcc') ||
    (rfqRegionNorm.includes('saudi') && vendorRegionNorm === 'gcc') ||
    (rfqRegionNorm.includes('nigeria') && vendorRegionNorm === 'africa') ||
    (rfqRegionNorm.includes('ghana') && vendorRegionNorm === 'africa')
  ) {
    score += 30
  }

  // Tier bonus
  if (vendor.tier === 'enterprise') score += 20
  else if (vendor.tier === 'featured') score += 15
  else if (vendor.tier === 'standard') score += 8

  // Verified bonus
  if (vendor.verified) score += 10

  // Capacity signal (fresh vendors with fewer RFQs have more bandwidth)
  if (vendor.rfq_count < 5) score += 5
  else if (vendor.rfq_count < 20) score += 2

  return Math.min(100, score)
}

/**
 * Sort and filter vendors for an RFQ, returning top N matches
 */
export function matchVendorsToRFQ(
  vendors: VendorForScoring[],
  rfq: RFQForScoring,
  topN = 5
): Array<VendorForScoring & { matchScore: number }> {
  return vendors
    .map(v => ({ ...v, matchScore: scoreVendorMatch(v, rfq) }))
    .filter(v => v.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, topN)
}

// ── SEO HELPERS ───────────────────────────────────────────────────────────────

/**
 * Generate TechnicalArticle schema markup for knowledge base articles
 */
export function generateArticleSchema(article: {
  title: string
  description: string
  slug: string
  author_name: string
  published_at: string | null
  updated_at: string
  seo_keywords: string[]
  reading_time: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.description,
    url: `https://hoistmarket.com/knowledge-base/${article.slug}`,
    author: {
      '@type': 'Organization',
      name: article.author_name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'HoistMarket',
      url: 'https://hoistmarket.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hoistmarket.com/logo.png',
      },
    },
    datePublished: article.published_at || article.updated_at,
    dateModified: article.updated_at,
    keywords: article.seo_keywords.join(', '),
    timeRequired: `PT${article.reading_time}M`,
    inLanguage: 'en',
    about: {
      '@type': 'Thing',
      name: 'Lifting Equipment',
    },
  }
}

/**
 * Generate LocalBusiness schema for vendor profiles
 */
export function generateVendorSchema(vendor: {
  company_name: string
  description: string | null
  slug: string
  city: string
  country: string
  email: string
  phone: string | null
  website: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: vendor.company_name,
    description: vendor.description,
    url: `https://hoistmarket.com/directory/${vendor.slug}`,
    email: vendor.email,
    telephone: vendor.phone,
    sameAs: vendor.website ? [vendor.website] : [],
    address: {
      '@type': 'PostalAddress',
      addressLocality: vendor.city,
      addressCountry: vendor.country,
    },
  }
}

// ── VALIDATION ────────────────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidUrl(url: string): boolean {
  try { new URL(url); return true } catch { return false }
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length >= 2 && slug.length <= 100
}

// ── CLASSNAMES HELPER ────────────────────────────────────────────────────────

/**
 * Conditionally join class names (lightweight clsx alternative)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
