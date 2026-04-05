import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabaseServer'
import { Suspense } from 'react'
import Link from 'next/link'
import { Clock, Search, BookOpen, ArrowRight, ChevronRight, Star } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import UnitConverter from '@/components/UnitConverter'
import SponsoredBanner from '@/components/SponsoredBanner'
import type { Database } from '@/types/database'

export const metadata: Metadata = {
  title: 'Knowledge Base — Lifting Equipment Technical Guides & Standards | HoistMarket',
  description:
    'In-depth technical guides for lifting professionals: ASME B30, FEM classification, crane duty cycles, wire rope inspection, NCCCO/LEEA certification, and EOT crane TCO analysis.',
}

export const revalidate = 300

const CATEGORIES = ['All', 'Standards', 'Procurement', 'Market Intelligence', 'Technical Specs', 'Inspection', 'Certification']

const CAT_ICONS: Record<string, string> = {
  Standards: '📐', Procurement: '💰', 'Market Intelligence': '📊',
  'Technical Specs': '⚙️', Inspection: '🔍', Certification: '🏆',
}

async function getArticles() {
  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title, excerpt, category, tags, reading_time, views_count, is_featured, published_at')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(30)
  if (error) {
    console.error('[KB] Supabase error:', error.message)
    return []
  }
  return data ?? []
}

export default async function KnowledgeBasePage() {
  const articles = await getArticles()
  const featured = articles.filter(a => a.is_featured)
  const regular  = articles.filter(a => !a.is_featured)
  const categories = Array.from(new Set(articles.map((a: any) => a.category as string)))

  return (
    <>
      <Navbar />
      <main>
        {/* Page hero */}
        <div className="bg-navy-950 pt-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="max-w-3xl">
              <div className="text-xs font-bold tracking-[0.2em] uppercase text-orange-400 mb-3">Knowledge Base</div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
                Technical Guides &<br /><span className="text-orange-500">Standards Reference</span>
              </h1>
              <p className="text-slate-400 text-base leading-relaxed mb-6">
                In-depth articles for lifting engineers, EPC procurement managers, and plant operations teams.
                Written by industry practitioners — not content agencies.
              </p>

              {/* Search — client-side via DirectoryClient pattern */}
              <form action="/knowledge-base/search" method="GET" className="flex max-w-lg">
                <div className="flex flex-1 bg-white rounded-l-xl overflow-hidden border border-r-0 border-slate-200">
                  <Search className="w-4 h-4 text-slate-400 my-auto ml-4 flex-shrink-0" />
                  <input
                    name="q"
                    className="flex-1 px-3 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
                    placeholder="Search ASME B30, FEM classification, NCCCO..."
                  />
                </div>
                <button type="submit" className="px-5 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-r-xl transition-colors">
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Standards bar */}
        <div className="bg-black/60 border-b border-white/5 py-3">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 flex-wrap">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-600">Standards Covered</span>
            <div className="flex gap-5 flex-wrap">
              {['ASME B30', 'FEM 1.001', 'EN 13000/14439', 'LOLER 1998', 'DNVGL-ST-0378', 'ISO 4306', 'OSHA 1926.1400', 'IS 3177'].map(s => (
                <span key={s} className="text-xs font-semibold text-slate-500">
                  <span className="text-orange-400/80">{s.split(' ')[0]}</span>{' '}{s.split(' ').slice(1).join(' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-10 items-start">
            {/* Main content */}
            <div className="lg:col-span-2">
              {/* Category tabs */}
              <div className="flex items-center gap-2 flex-wrap mb-8">
                {CATEGORIES.filter(c => c === 'All' || categories.includes(c)).map(cat => (
                  <Link
                    key={cat}
                    href={cat === 'All' ? '/knowledge-base' : `/knowledge-base?category=${encodeURIComponent(cat)}`}
                    className="px-4 py-2 text-xs font-bold rounded-full border transition-colors border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 bg-white"
                  >
                    {cat !== 'All' && CAT_ICONS[cat] ? `${CAT_ICONS[cat]} ` : ''}{cat}
                  </Link>
                ))}
              </div>

              {articles.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
                  <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="font-bold text-navy-900 mb-2">No articles yet</h3>
                  <p className="text-slate-500 text-sm">Articles are published in the admin dashboard.</p>
                  <Link href="/admin/content" className="mt-4 inline-flex items-center gap-2 text-sm text-orange-500 font-semibold hover:text-orange-600">
                    Go to Admin → Content
                  </Link>
                </div>
              ) : (
                <>
                  {/* Featured articles */}
                  {featured.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-5">
                        <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
                        <h2 className="font-bold text-navy-900 text-sm uppercase tracking-wider">Pillar Articles</h2>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-5">
                        {featured.map(article => (
                          <Link
                            key={article.id}
                            href={`/knowledge-base/${article.slug}`}
                            className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-orange-300 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="h-40 bg-navy-900 flex items-center justify-center text-5xl relative">
                              {CAT_ICONS[article.category] ?? '📄'}
                              <div className="absolute top-3 left-3">
                                <span className="text-xs font-bold bg-orange-500 text-white px-2.5 py-1 rounded-full">
                                  {article.category}
                                </span>
                              </div>
                            </div>
                            <div className="p-5">
                              <div className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" /> {article.reading_time} min read
                              </div>
                              <h3 className="font-bold text-navy-900 text-base leading-snug mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                                {article.title}
                              </h3>
                              {article.excerpt && (
                                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3">{article.excerpt}</p>
                              )}
                              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <span className="text-xs text-slate-400">
                                  {new Date(article.published_at ?? '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="text-xs font-bold text-orange-500 group-hover:translate-x-0.5 transition-transform inline-block">Read →</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All articles */}
                  {regular.length > 0 && (
                    <div>
                      <h2 className="font-bold text-navy-900 text-sm uppercase tracking-wider mb-5">All Articles</h2>
                      <div className="space-y-0 divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                        {regular.map(article => (
                          <Link
                            key={article.id}
                            href={`/knowledge-base/${article.slug}`}
                            className="flex items-start gap-4 p-5 bg-white hover:bg-slate-50 transition-colors group"
                          >
                            <div className="text-3xl flex-shrink-0 mt-1">{CAT_ICONS[article.category] ?? '📄'}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                  {article.category}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {article.reading_time} min
                                </span>
                              </div>
                              <h3 className="font-semibold text-navy-900 text-base leading-snug group-hover:text-orange-600 transition-colors">
                                {article.title}
                              </h3>
                              {article.excerpt && (
                                <p className="text-slate-500 text-sm mt-1 line-clamp-1">{article.excerpt}</p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 flex-shrink-0 mt-1 transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5 lg:sticky lg:top-24">
              {/* Quote CTA */}
              <div className="bg-navy-900 rounded-2xl p-5 text-center">
                <h3 className="text-white font-bold text-base mb-2">Need Equipment?</h3>
                <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                  Submit an RFQ and receive matched quotes from verified vendors within 48 hours.
                </p>
                <button
                  onClick={() => {}}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors"
                >
                  Request a Quote →
                </button>
              </div>

              {/* Unit Converter */}
              <UnitConverter />

              {/* Sponsored */}
              <SponsoredBanner placement="kb_sidebar" />

              {/* Certifications quick ref */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-bold text-navy-900 text-sm mb-4 pb-2 border-b-2 border-orange-500 inline-block">
                  Certification Quick Reference
                </h3>
                <div className="space-y-2">
                  {[
                    { code: 'NCCCO', desc: 'North America — Crane operators', link: 'nccco-cpcs-leea-certification-guide' },
                    { code: 'CPCS',  desc: 'UK — Construction plant', link: 'nccco-cpcs-leea-certification-guide' },
                    { code: 'LEEA',  desc: 'International — Lifting equipment', link: 'nccco-cpcs-leea-certification-guide' },
                    { code: 'OPITO', desc: 'Offshore — Petroleum industry', link: 'nccco-cpcs-leea-certification-guide' },
                    { code: 'IRATA', desc: 'International — Rope access', link: 'nccco-cpcs-leea-certification-guide' },
                  ].map(cert => (
                    <Link key={cert.code} href={`/knowledge-base/${cert.link}`}
                      className="flex items-center justify-between py-2 border-b border-slate-100 hover:bg-slate-50 -mx-1 px-1 rounded transition-colors group"
                    >
                      <div>
                        <span className="font-bold text-sm text-navy-900 font-mono">{cert.code}</span>
                        <span className="text-xs text-slate-500 ml-2">{cert.desc}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
