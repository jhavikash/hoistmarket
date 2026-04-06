import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/dashboard/', '/api/', '/auth/'],
      },
    ],
    sitemap: 'https://hoistmarket.com/sitemap.xml',
    host: 'https://hoistmarket.com',
  }
}
