import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://hoistmarket.com'),
  title: {
    default: 'HoistMarket — Global Lifting Equipment & Material Handling Platform',
    template: '%s | HoistMarket',
  },
  description:
    'The neutral B2B reference platform, vendor directory, and equipment marketplace for lifting professionals across India, GCC, and West Africa.',
  keywords: [
    'crane specifications', 'lifting equipment', 'EOT crane', 'ASME B30', 'FEM classification',
    'hoist rental India', 'crane rental GCC', 'rigging standards', 'material handling',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hoistmarket.com',
    siteName: 'HoistMarket',
    title: 'HoistMarket — Global Lifting Equipment Platform',
    description: 'Technical reference, vendor directory, and RFQ platform for the lifting industry.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'HoistMarket' }],
  },
  twitter: { card: 'summary_large_image', site: '@hoistmarket' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'HoistMarket',
              url: 'https://hoistmarket.com',
              description: 'Neutral B2B platform for the global lifting equipment industry',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://hoistmarket.com/search?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
              publisher: {
                '@type': 'Organization',
                name: 'HoistMarket',
                url: 'https://hoistmarket.com',
                contactPoint: {
                  '@type': 'ContactPoint',
                  email: 'info@hoistmarket.com',
                  contactType: 'customer service',
                },
              },
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-white text-slate-900">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#102a43', color: '#fff', border: '1px solid #243b53' },
            success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        {children}
      </body>
    </html>
  )
}
