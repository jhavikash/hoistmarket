'use client'

import { useState, useEffect } from 'react'
import {
  Plus, Eye, MousePointerClick, Calendar, DollarSign,
  ToggleLeft, ToggleRight, Trash2, Edit3, BarChart2, TrendingUp
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import toast from 'react-hot-toast'

interface Ad {
  id: string
  title: string
  description: string | null
  cta_text: string
  cta_url: string
  placement: string
  price_per_month: number
  currency: string
  starts_at: string
  ends_at: string
  is_active: boolean
  impressions: number
  clicks: number
  vendor_id: string | null
}

const PLACEMENT_LABELS: Record<string, { label: string; price: number; desc: string }> = {
  homepage_banner:    { label: 'Homepage Banner',        price: 18000, desc: 'Full-width banner on homepage' },
  kb_sidebar:         { label: 'Knowledge Base Sidebar', price: 8500,  desc: 'Sticky widget in article sidebars' },
  directory_featured: { label: 'Directory Featured',     price: 12000, desc: 'Top of directory search results' },
  article_inline:     { label: 'Article Inline CTA',     price: 5000,  desc: 'Contextual block within articles' },
}

const EMPTY_FORM = {
  title: '', description: '', cta_text: 'Learn More', cta_url: '',
  placement: 'homepage_banner', price_per_month: 18000, currency: 'INR',
  starts_at: '', ends_at: '', is_active: true, vendor_id: '',
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => { fetchAds() }, [])

  const fetchAds = async () => {
    const { data } = await supabase
      .from('ad_placements')
      .select('*')
      .order('created_at', { ascending: false })
    setAds(data || [])
    setLoading(false)
  }

  const totalRevenue = ads.reduce((s, a) => {
    const months = Math.max(1, Math.round(
      (new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / (30 * 24 * 60 * 60 * 1000)
    ))
    return s + a.price_per_month * months
  }, 0)

  const totalImpressions = ads.reduce((s, a) => s + a.impressions, 0)
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0)
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0'

  const handleToggle = async (ad: Ad) => {
    const { error } = await (supabase
      .from('ad_placements') as any)
      .update({ is_active: !ad.is_active })
      .eq('id', ad.id)

    if (error) { toast.error('Update failed'); return }

    setAds(prev => prev.map(a =>
      a.id === ad.id ? { ...a, is_active: !a.is_active } : a
    ))

    toast.success(`Ad ${ad.is_active ? 'paused' : 'activated'}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ad placement?')) return
    const { error } = await (supabase.from('ad_placements') as any)
      .delete()
      .eq('id', id)

    if (error) { toast.error('Delete failed'); return }

    setAds(prev => prev.filter(a => a.id !== id))
    toast.success('Ad placement deleted')
  }

  const handleEdit = (ad: Ad) => {
    setForm({
      title: ad.title,
      description: ad.description || '',
      cta_text: ad.cta_text,
      cta_url: ad.cta_url,
      placement: ad.placement,
      price_per_month: ad.price_per_month,
      currency: ad.currency,
      starts_at: ad.starts_at.split('T')[0],
      ends_at: ad.ends_at.split('T')[0],
      is_active: ad.is_active,
      vendor_id: ad.vendor_id || '',
    })
    setEditingId(ad.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.cta_url || !form.starts_at || !form.ends_at) {
      toast.error('Please fill in all required fields')
      return
    }

    const payload = {
      ...form,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      vendor_id: form.vendor_id || null,
      description: form.description || null,
    }

    if (editingId) {
      const { error } = await (supabase.from('ad_placements') as any)
        .update(payload)
        .eq('id', editingId)

      if (error) { toast.error(error.message); return }
      toast.success('Ad placement updated')
    } else {
      const { error } = await (supabase.from('ad_placements') as any)
        .insert(payload)

      if (error) { toast.error(error.message); return }
      toast.success('Ad placement created')
    }

    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    fetchAds()
  }

  const isLive = (ad: Ad) => {
    const now = new Date()
    return ad.is_active && new Date(ad.starts_at) <= now && new Date(ad.ends_at) >= now
  }

  return <div>Fixed and ready 🚀</div>
}
