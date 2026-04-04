import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://hoistmarket.com'

  // Fetch dynamic pages
  const [{ data: articles }, { data: vendors }] = await Promise.all([
    supabase.from('articles').select('slug, updated_at').eq('is_published', true),
    supabase.from('vendors').select('slug, updated_at').eq('is_active', true),
  ])

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/knowledge-base`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/directory`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/equipment`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/rentals`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  const rentalPages: MetadataRoute.Sitemap = [
    'crawler-cranes-india', 'mobile-cranes-uae', 'tower-cranes-gcc',
    'eot-cranes-india', 'equipment-nigeria', 'equipment-west-africa',
    'equipment-qatar', 'equipment-south-india',
  ].map(slug => ({
    url: `${baseUrl}/rentals/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const articlePages: MetadataRoute.Sitemap = (articles || []).map(article => ({
    url: `${baseUrl}/knowledge-base/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const vendorPages: MetadataRoute.Sitemap = (vendors || []).map(vendor => ({
    url: `${baseUrl}/directory/${vendor.slug}`,
    lastModified: new Date(vendor.updated_at),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...rentalPages, ...articlePages, ...vendorPages]
}
