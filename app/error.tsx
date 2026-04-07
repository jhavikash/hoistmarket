'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body className="bg-navy-950 min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3">Something went wrong</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            An unexpected error occurred. The issue has been logged. 
            Try refreshing the page or returning to the homepage.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-600 mb-6">Error ID: {error.digest}</p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <a href="/" className="flex items-center gap-2 px-5 py-2.5 border border-white/10 text-white/70 hover:text-white font-medium text-sm rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" /> Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
