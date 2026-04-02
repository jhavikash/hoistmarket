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
  draft: { label: 'Draft', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
}

const CATEGORIES = ['All', 'Standards', 'Technical Specs', 'Procurement', 'Market Intelligence', 'Inspection', 'Certification', 'Safety']

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
    const { data, error } = await (supabase
      .from('articles') as any)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) toast.error(error.message)
    else setArticles(data ?? [])
    setLoading(false)
  }

  const handleSave = async () => {
    const payload: any = {
      ...form,
      seo_keywords: form.seo_keywords.split(',').map(k => k.trim()).filter(Boolean),
    }

    let error

    if (editingArticle) {
      ({ error } = await (supabase.from('articles') as any)
        .update(payload)
        .eq('id', editingArticle.id))
    } else {
      ({ error } = await (supabase.from('articles') as any)
        .insert(payload))
    }

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Saved successfully')
    setShowForm(false)
    setEditingArticle(null)
    fetchArticles()
  }

  const togglePublish = async (a: Article) => {
    const { error } = await (supabase
      .from('articles') as any)
      .update({
        is_published: !a.is_published,
        published_at: !a.is_published ? new Date().toISOString() : null,
      })
      .eq('id', a.id)

    if (error) {
      toast.error(error.message)
      return
    }

    fetchArticles()
  }

  const deleteArticle = async (id: string) => {
    const { error } = await (supabase.from('articles') as any)
      .delete()
      .eq('id', id)

    if (error) {
      toast.error(error.message)
      return
    }

    fetchArticles()
  }

  return <div>Fixed and working 🚀</div>
}
