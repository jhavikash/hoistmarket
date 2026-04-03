'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plus, Eye, CheckCircle, Clock, Edit3, Trash2,
  BarChart2, Globe, FileText, Tag, Search, RefreshCw
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface Article {
  id: string
  slug: string
  title: string
  category: string
  reading_time: number
  views_count: number
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  created_at: string
  seo_keywords: string[]
  tags: string[]
}

const STATUS_CONFIG = {
  published: { label: 'Published', color: 'bg-green-50 text-green-700 border-green-200' },
  draft:     { label: 'Draft',     color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
}

const CATEGORIES = ['All', 'Standards', 'Technical Specs', 'Procurement', 'Market Intelligence', 'Inspection', 'Certification', 'Safety']

// Calendar data — articles mapped to days
const CALENDAR_SCHEDULE = [
  { day: 3,  title: 'EOT Crane TCO Guide',          type: 'done' },
  { day: 7,  title: 'ASME B30 vs ISO vs FEM',       type: 'done' },
  { day: 10, title: 'Wire Rope Inspection Guide',   type: 'done' },
  { day: 14, title: 'India Market Outlook 2026',    type: 'done' },
  { day: 18, title: 'NCCCO vs CPCS vs LEEA',        type: 'done' },
  { day: 22, title: 'FEM Duty Classification',      type: 'done' },
  { day: 25, title: 'Crawler Crane Selection',      type: 'draft' },
  { day: 28, title: 'Port Cranes West Africa',      type: 'draft' },
  { day: 31, title: 'Strand Jack Deep Dive',        type: 'planned' },
]

export default function AdminContentPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', category: 'Standards',
    content: '', seo_title: '', seo_description: '', seo_keywords: '',
    reading_time: 8, is_published: false, is_featured: false,
  })

  useEffect(() => { fetchArticles() }, [])

  const fetchArticles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('articles')
      .select('id,slug,title,category,reading_time,views_count,is_published,is_featured,published_at,created_at,seo_keywords,tags')
      .order('created_at', { ascending: false })

    if (error) toast.error('Failed to load articles: ' + error.message)
    else setArticles(data ?? [])
    setLoading(false)
  }

  const filtered = articles.filter(a => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'All' || a.category === catFilter
    return matchSearch && matchCat
  })

  const handleEditClick = (a: Article) => {
    setEditingArticle(a)
    setForm({
      title: a.title, slug: a.slug,
      excerpt: '', category: a.category,
      content: '', seo_title: '',
      seo_description: '',
      seo_keywords: a.seo_keywords?.join(', ') ?? '',
      reading_time: a.reading_time,
      is_published: a.is_published,
      is_featured: a.is_featured,
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.slug) {
      toast.error('Title and slug are required')
      return
    }

    const payload: any = {
      title: form.title,
      slug: form.slug,
      category: form.category,
      reading_time: form.reading_time,
      is_published: form.is_published,
      is_featured: form.is_featured,
      seo_keywords: form.seo_keywords.split(',').map(k => k.trim()).filter(Boolean),
      published_at: form.is_published ? new Date().toISOString() : null,
    }

    if (form.excerpt) payload.excerpt = form.excerpt
    if (form.content) payload.content = form.content
    if (form.seo_title) payload.seo_title = form.seo_title
    if (form.seo_description) payload.seo_description = form.seo_description

    let error
    if (editingArticle) {
      ({ error } = await supabase.from('articles').update(payload).eq('id', editingArticle.id))
    } else {
      if (!form.content) {
        toast.error('Content is required for new articles')
        return
      }
      payload.content = form.content;
      ({ error } = await supabase.from('articles').insert(payload))
    }

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success(editingArticle ? 'Article updated' : 'Article created')
    setShowForm(false)
    setEditingArticle(null)
    setForm({ title:'', slug:'', excerpt:'', category:'Standards', content:'', seo_title:'', seo_description:'', seo_keywords:'', reading_time:8, is_published:false, is_featured:false })
    fetchArticles()
  }

  const togglePublish = async (a: Article) => {
    const { error } = await supabase
      .from('articles')
      .update({
        is_published: !a.is_published,
        published_at: !a.is_published ? new Date().toISOString() : null,
      })
      .eq('id', a.id)

    if (error) { toast.error(error.message); return }
    toast.success(!a.is_published ? 'Article published' : 'Article unpublished')
    fetchArticles()
  }

  const deleteArticle = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return
    const { error } = await supabase.from('articles').delete().eq('id', id)
    if (error) { toast.error(error.message); return }
    toast.success('Article deleted')
    fetchArticles()
  }

  const published = articles.filter(a => a.is_published).length
  const drafts = articles.filter(a => !a.is_published).length
  const totalViews = articles.reduce((s, a) => s + (a.views_count ?? 0), 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-navy-900">Content Calendar</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage articles, SEO metadata, and publishing schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchArticles} className="p-2 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setEditingArticle(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> New Article
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Published',      value: published,   icon: CheckCircle, color: 'text-green-500 bg-green-50' },
          { label: 'Drafts',         value: drafts,      icon: Clock,       color: 'text-yellow-500 bg-yellow-50' },
          { label: 'Total Articles', value: articles.length, icon: FileText, color: 'text-blue-500 bg-blue-50' },
          { label: 'Total Views',    value: totalViews,  icon: Eye,         color: 'text-purple-500 bg-purple-50' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${k.color} flex items-center justify-center mb-3`}>
              <k.icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-extrabold text-navy-900 mb-0.5">{k.value.toLocaleString()}</div>
            <div className="text-xs text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* March 2026 Calendar */}
      <div className="bg-white rounded-xl border border-slate-200 mb-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-navy-900 text-sm">March 2026 Publishing Schedule</h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-green-500 inline-block" /> Published</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-400 inline-block" /> Draft</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-300 inline-block" /> Planned</span>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-slate-400 py-1.5 bg-slate-50 rounded">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* Blank for Mon Mar 1 starting position - first day is Saturday, so offset 5 */}
            {[...Array(5)].map((_, i) => <div key={`blank-${i}`} className="min-h-[56px] bg-slate-50/30 rounded" />)}
            {[...Array(31)].map((_, idx) => {
              const day = idx + 1
              const ev = CALENDAR_SCHEDULE.find(e => e.day === day)
              const isToday = day === 15
              return (
                <div key={day} className={`min-h-[56px] rounded p-1.5 border ${
                  isToday ? 'border-orange-300 bg-orange-50' : 'border-slate-100 bg-white hover:bg-slate-50'
                } transition-colors`}>
                  <div className={`text-xs font-bold mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-orange-500 text-white' : 'text-slate-400'
                  }`}>{day}</div>
                  {ev && (
                    <div className={`text-[9px] leading-tight px-1 py-0.5 rounded font-medium text-white truncate ${
                      ev.type === 'done' ? 'bg-green-500' : ev.type === 'draft' ? 'bg-slate-400' : 'bg-slate-300 text-slate-600'
                    }`} title={ev.title}>{ev.title}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Article Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-bold text-navy-900 text-sm">
              {editingArticle ? `Edit: ${editingArticle.title.slice(0, 40)}...` : 'Create New Article'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingArticle(null) }} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Article title — this becomes the H1 and page title" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">URL Slug *</label>
                <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="article-url-slug" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Excerpt</label>
              <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows={2} placeholder="1–2 sentence summary used in cards and meta description" />
            </div>
            {!editingArticle && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Content (Markdown) *</label>
                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                  rows={8} placeholder="## Heading 2&#10;&#10;Paragraph text...&#10;&#10;| Column 1 | Column 2 |&#10;|---|---|&#10;| Row | Data |" />
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Reading Time (min)</label>
                <input type="number" value={form.reading_time} onChange={e => setForm(p => ({ ...p, reading_time: parseInt(e.target.value, 10) || 5 }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" min={1} max={60} />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">SEO Keywords (comma-separated)</label>
                <input value={form.seo_keywords} onChange={e => setForm(p => ({ ...p, seo_keywords: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="crane safety standards, ASME B30, FEM classification" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500" />
                <span className="text-sm font-semibold text-slate-700">Publish immediately</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500" />
                <span className="text-sm font-semibold text-slate-700">Featured on homepage</span>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors">
                {editingArticle ? 'Save Changes' : 'Create Article'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingArticle(null) }} className="px-5 py-2.5 border border-slate-200 text-slate-600 font-medium text-sm rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article List */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                  catFilter === c ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300'
                }`}>{c}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Loading articles…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">{search ? 'No articles match your search' : 'No articles yet — create your first one!'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-400">Views</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Published</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-semibold text-navy-900 text-sm max-w-xs truncate" title={a.title}>{a.title}</div>
                      <div className="text-xs font-mono text-slate-400 mt-0.5 truncate">/{a.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium">{a.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        a.is_published ? STATUS_CONFIG.published.color : STATUS_CONFIG.draft.color
                      }`}>
                        {a.is_published ? 'Published' : 'Draft'}
                        {a.is_featured && a.is_published && ' ⭐'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 text-slate-600 font-semibold text-sm">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {(a.views_count ?? 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {a.published_at ? new Date(a.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/knowledge-base/${a.slug}`} target="_blank"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Preview">
                          <Globe className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => handleEditClick(a)}
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Edit">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => togglePublish(a)}
                          className={`p-1.5 rounded transition-colors ${
                            a.is_published ? 'text-green-500 hover:text-slate-500 hover:bg-slate-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                          }`} title={a.is_published ? 'Unpublish' : 'Publish'}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteArticle(a.id, a.title)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
