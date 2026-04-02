import Link from 'next/link'
import { ArrowLeft, Search, BookOpen, Users } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-navy-950 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-lg">
            {/* Large 404 */}
            <div className="font-extrabold text-[120px] leading-none text-white/5 select-none mb-2">
              404
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-3 -mt-4">
              Page Not Found
            </h1>
            <p className="text-slate-400 text-base leading-relaxed mb-10">
              This page doesn't exist or has been moved. Use the links below to find what you need.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: BookOpen, label: 'Knowledge Base', href: '/knowledge-base', desc: 'Technical guides & standards' },
                { icon: Users, label: 'Vendor Directory', href: '/directory', desc: 'Verified suppliers' },
                { icon: Search, label: 'Equipment Hub', href: '/equipment', desc: 'Specs & classifications' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-orange-500/30 transition-all group"
                >
                  <item.icon className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                  <div className="text-white text-xs font-bold mb-1 group-hover:text-orange-400 transition-colors">{item.label}</div>
                  <div className="text-slate-500 text-[10px]">{item.desc}</div>
                </Link>
              ))}
            </div>

            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Homepage
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
