'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface AdPlacement {
  id: string
  title: string
  description: string | null
  cta_text: string
  cta_url: string
  placement: string
  image_url: string | null
}

interface SponsoredBannerProps {
  placement: 'homepage_banner' | 'kb_sidebar' | 'directory_featured' | 'article_inline'
  className?: string
  dismissible?: boolean
  fallback?: {
    title: string
    description: string
    cta: string
    ctaUrl: string
    icon?: string
  }
}

// Static fallback ads
const FALLBACK_ADS: Record<string, SponsoredBannerProps['fallback']> = {
  homepage_banner: {
    title: 'Konecranes India — Certified Service Partner Network',
    description: 'Planned maintenance, inspections, and genuine spare parts for EOT cranes across India. 48-hour response SLA.',
    cta: 'Learn More',
    ctaUrl: '/directory/konecranes-india',
    icon: '⚙️',
  },
  kb_sidebar: {
    title: 'Hindustan Crane & Hoist',
    description: 'India\'s leading EOT crane manufacturer. 40+ years. Full project support.',
    cta: 'Request Quote',
    ctaUrl: '/directory/hindustan-crane-hoist',
    icon: '🏗️',
  },
  directory_featured: {
    title: 'Gulf Crane Solutions — GCC Region Partner',
    description: 'Mobile and crawler crane rental across UAE, Saudi Arabia, and Qatar.',
    cta: 'View Profile',
    ctaUrl: '/directory/gulf-crane-solutions',
    icon: '🚧',
  },
  article_inline: {
    title: 'Need equipment matching these specs?',
    description: 'Submit an RFQ and receive quotes from verified suppliers within 48 hours.',
    cta: 'Request a Quote',
    ctaUrl: '#',
    icon: '⚡',
  },
}

export default function SponsoredBanner({
  placement,
  className = '',
  dismissible = false,
  fallback,
}: SponsoredBannerProps) {
  const [ad, setAd] = useState<AdPlacement | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const fetchAd = async () => {
      const { data } = await supabase
        .from('ad_placements')
        .select('id, title, description, cta_text, cta_url, placement, image_url')
        .eq('placement', placement)
        .eq('is_active', true)
        .lte('starts_at', new Date().toISOString())
        .gte('ends_at', new Date().toISOString())
        .limit(1)
        .single()

      if (data) {
        setAd(data)
        // Track impression
        supabase
          .from('ad_placements')
          .update({ impressions: undefined }) // triggers RPC in production
          .eq('id', data.id)
      }
      setLoaded(true)
    }
    fetchAd()
  }, [placement])

  if (dismissed) return null

  const displayData = ad
    ? { title: ad.title, description: ad.description, cta: ad.cta_text, ctaUrl: ad.cta_url, icon: '🏗️' }
    : (fallback || FALLBACK_ADS[placement])

  if (!displayData) return null

  const handleClick = () => {
    if (ad) {
      // Track click
      supabase.from('ad_placements').update({ clicks: undefined }).eq('id', ad.id)
    }
  }

  // ── SIDEBAR VARIANT ──
  if (placement === 'kb_sidebar') {
    return (
      <div className={`bg-gradient-to-br from-navy-900 to-navy-800 border border-navy-700 rounded-xl p-5 relative overflow-hidden ${className}`}>
        <span className="absolute top-2 right-2 text-[9px] font-bold tracking-[0.2em] uppercase text-white/20">SPONSORED</span>
        {dismissible && (
          <button onClick={() => setDismissed(true)} className="absolute top-2 right-12 text-white/30 hover:text-white/60 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <div className="text-3xl mb-3">{displayData.icon}</div>
        <h4 className="text-white font-bold text-sm mb-1.5">{displayData.title}</h4>
        {displayData.description && (
          <p className="text-slate-400 text-xs leading-relaxed mb-4">{displayData.description}</p>
        )}
        <a
          href={displayData.ctaUrl}
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
        >
          {displayData.cta} <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    )
  }

  // ── ARTICLE INLINE VARIANT ──
  if (placement === 'article_inline') {
    return (
      <div className={`bg-orange-50 border border-orange-200 rounded-xl p-5 my-8 flex items-start gap-4 ${className}`}>
        <div className="text-3xl flex-shrink-0">{displayData.icon}</div>
        <div className="flex-1">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-1">Sponsored</p>
          <h4 className="font-bold text-navy-900 text-sm mb-1">{displayData.title}</h4>
          {displayData.description && (
            <p className="text-slate-600 text-xs leading-relaxed mb-3">{displayData.description}</p>
          )}
          <a
            href={displayData.ctaUrl}
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded transition-colors"
          >
            {displayData.cta} →
          </a>
        </div>
      </div>
    )
  }

  // ── BANNER VARIANT (default / homepage) ──
  return (
    <div className={`bg-gradient-to-r from-navy-900 to-navy-800 border border-navy-700 rounded-xl p-5 flex items-center gap-5 relative overflow-hidden ${className}`}>
      <span className="absolute top-2 right-3 text-[9px] font-bold tracking-[0.2em] uppercase text-white/20">SPONSORED</span>
      {dismissible && (
        <button onClick={() => setDismissed(true)} className="absolute top-3 right-16 text-white/30 hover:text-white/60 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      <div className="text-4xl flex-shrink-0">{displayData.icon}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-bold text-sm mb-1">{displayData.title}</h4>
        {displayData.description && (
          <p className="text-slate-400 text-xs leading-relaxed">{displayData.description}</p>
        )}
      </div>
      <a
        href={displayData.ctaUrl}
        onClick={handleClick}
        className="btn-ghost btn-sm flex-shrink-0 hidden sm:inline-flex whitespace-nowrap"
      >
        {displayData.cta} →
      </a>
    </div>
  )
}
