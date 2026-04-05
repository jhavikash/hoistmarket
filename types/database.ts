// Auto-generated types matching lib/schema.sql exactly
// Column names MUST match the database schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company: string | null
          phone: string | null
          role: 'admin' | 'vendor' | 'user'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company?: string | null
          phone?: string | null
          role?: 'admin' | 'vendor' | 'user'
          avatar_url?: string | null
        }
        Update: {
          email?: string
          full_name?: string | null
          company?: string | null
          phone?: string | null
          role?: 'admin' | 'vendor' | 'user'
          avatar_url?: string | null
          updated_at?: string
          [key: string]: unknown
        }
      }
      vendors: {
        Row: {
          id: string
          profile_id: string | null
          company_name: string
          slug: string
          description: string | null
          country: string
          city: string
          region: 'india' | 'gcc' | 'africa' | 'asia' | 'europe' | 'americas'
          equipment_categories: string[]
          tier: 'free' | 'standard' | 'featured' | 'enterprise'
          verified: boolean
          featured: boolean
          logo_url: string | null
          website: string | null
          email: string
          phone: string | null
          whatsapp: string | null
          specializations: string[]
          certifications: string[]
          year_established: number | null
          employee_count: string | null
          annual_revenue: string | null
          membership_expires_at: string | null
          views_count: number
          rfq_count: number
          is_active: boolean
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          profile_id?: string | null
          company_name: string
          slug: string
          description?: string | null
          country: string
          city: string
          region: 'india' | 'gcc' | 'africa' | 'asia' | 'europe' | 'americas'
          equipment_categories?: string[]
          tier?: 'free' | 'standard' | 'featured' | 'enterprise'
          verified?: boolean
          featured?: boolean
          logo_url?: string | null
          website?: string | null
          email: string
          phone?: string | null
          whatsapp?: string | null
          specializations?: string[]
          certifications?: string[]
          year_established?: number | null
          employee_count?: string | null
          annual_revenue?: string | null
          membership_expires_at?: string | null
          is_active?: boolean
          admin_notes?: string | null
        }
        Update: {
          profile_id?: string | null
          company_name?: string
          slug?: string
          description?: string | null
          country?: string
          city?: string
          region?: 'india' | 'gcc' | 'africa' | 'asia' | 'europe' | 'americas'
          equipment_categories?: string[]
          tier?: 'free' | 'standard' | 'featured' | 'enterprise'
          verified?: boolean
          featured?: boolean
          logo_url?: string | null
          website?: string | null
          email?: string
          phone?: string | null
          whatsapp?: string | null
          specializations?: string[]
          certifications?: string[]
          year_established?: number | null
          employee_count?: string | null
          membership_expires_at?: string | null
          is_active?: boolean
          admin_notes?: string | null
          views_count?: number
          rfq_count?: number
        }
      }
      rfqs: {
        Row: {
          id: string
          rfq_number: string
          requester_id: string | null
          requester_name: string
          requester_email: string
          requester_company: string | null
          requester_phone: string | null
          equipment_category: string
          equipment_subcategory: string | null
          required_capacity: string | null
          capacity_unit: 'tonnes' | 'kg' | 'lbs'        // matches schema column name
          span_required: string | null
          lift_height: string | null
          duty_class: string | null
          site_region: string
          site_country: string | null
          site_details: string | null
          rental_duration: string | null
          rental_start_date: string | null
          project_description: string | null
          budget_range: string | null
          special_requirements: string | null
          urgency: 'low' | 'medium' | 'high' | 'urgent'
          status: 'new' | 'reviewing' | 'matched' | 'dispatched' | 'in_progress' | 'closed' | 'cancelled'
          admin_notes: string | null
          matched_vendor_ids: string[]                   // matches schema column name
          dispatched_to: string[]
          dispatched_at: string | null
          dispatch_message: string | null
          commission_rate: number | null
          expected_commission: number | null
          commission_currency: string
          commission_status: 'pending' | 'expected' | 'invoiced' | 'received' | 'cancelled'
          commission_received_at: string | null
          actual_deal_value: number | null
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          requester_id?: string | null
          requester_name: string
          requester_email: string
          requester_company?: string | null
          requester_phone?: string | null
          equipment_category: string
          equipment_subcategory?: string | null
          required_capacity?: string | null
          capacity_unit?: 'tonnes' | 'kg' | 'lbs'
          span_required?: string | null
          lift_height?: string | null
          duty_class?: string | null
          site_region: string
          site_country?: string | null
          site_details?: string | null
          rental_duration?: string | null
          rental_start_date?: string | null
          project_description?: string | null
          budget_range?: string | null
          special_requirements?: string | null
          urgency?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'new' | 'reviewing' | 'matched' | 'dispatched' | 'in_progress' | 'closed' | 'cancelled'
          admin_notes?: string | null
          matched_vendor_ids?: string[]
          dispatched_to?: string[]
          dispatched_at?: string | null
          dispatch_message?: string | null
          commission_rate?: number | null
          expected_commission?: number | null
          commission_currency?: string
          commission_status?: 'pending' | 'expected' | 'invoiced' | 'received' | 'cancelled'
          source?: string
        }
        Update: {
          status?: 'new' | 'reviewing' | 'matched' | 'dispatched' | 'in_progress' | 'closed' | 'cancelled'
          admin_notes?: string | null
          matched_vendor_ids?: string[]
          dispatched_to?: string[]
          dispatched_at?: string | null
          dispatch_message?: string | null
          commission_rate?: number | null
          expected_commission?: number | null
          commission_status?: 'pending' | 'expected' | 'invoiced' | 'received' | 'cancelled'
          commission_received_at?: string | null
          actual_deal_value?: number | null
        }
      }
      rfq_responses: {
        Row: {
          id: string
          rfq_id: string
          vendor_id: string
          status: 'received' | 'quoted' | 'accepted' | 'declined' | 'expired'
          quote_amount: number | null
          quote_currency: string
          message: string | null
          responded_at: string
          created_at: string
        }
        Insert: {
          rfq_id: string
          vendor_id: string
          status?: 'received' | 'quoted' | 'accepted' | 'declined' | 'expired'
          quote_amount?: number | null
          quote_currency?: string
          message?: string | null
          responded_at?: string
        }
        Update: {
          status?: 'received' | 'quoted' | 'accepted' | 'declined' | 'expired'
          quote_amount?: number | null
          quote_currency?: string
          message?: string | null
          responded_at?: string
        }
      }
      articles: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string | null
          content: string
          category: string
          subcategory: string | null
          tags: string[]
          author_id: string | null
          author_name: string
          featured_image: string | null
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string[]
          schema_type: string
          reading_time: number
          views_count: number
          is_published: boolean
          is_featured: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          slug: string
          title: string
          excerpt?: string | null
          content?: string
          category: string
          subcategory?: string | null
          tags?: string[]
          author_id?: string | null
          author_name?: string
          featured_image?: string | null
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[]
          schema_type?: string
          reading_time?: number
          is_published?: boolean
          is_featured?: boolean
          published_at?: string | null
        }
        Update: {
          slug?: string
          title?: string
          excerpt?: string | null
          content?: string
          category?: string
          subcategory?: string | null
          tags?: string[]
          author_id?: string | null
          author_name?: string
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string[]
          reading_time?: number
          is_published?: boolean
          is_featured?: boolean
          published_at?: string | null
        }
      }
      memberships: {
        Row: {
          id: string
          vendor_id: string
          tier: 'standard' | 'featured' | 'enterprise'
          price_inr: number
          price_usd: number
          billing_cycle: 'monthly' | 'annual'
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: 'active' | 'past_due' | 'cancelled' | 'expired'
          starts_at: string
          expires_at: string
          cancelled_at: string | null
          created_at: string
        }
        Insert: {
          vendor_id: string
          tier: 'standard' | 'featured' | 'enterprise'
          price_inr: number
          price_usd: number
          billing_cycle: 'monthly' | 'annual'
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: 'active' | 'past_due' | 'cancelled' | 'expired'
          starts_at?: string
          expires_at: string
        }
        Update: {
          tier?: 'standard' | 'featured' | 'enterprise'
          price_inr?: number
          price_usd?: number
          billing_cycle?: 'monthly' | 'annual'
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: 'active' | 'past_due' | 'cancelled' | 'expired'
          starts_at?: string
          expires_at?: string
          cancelled_at?: string | null
        }
      }
      ad_placements: {
        Row: {
          id: string
          vendor_id: string | null
          title: string
          description: string | null
          cta_text: string
          cta_url: string
          placement: 'homepage_banner' | 'kb_sidebar' | 'directory_featured' | 'article_inline'
          image_url: string | null
          price_per_month: number
          currency: string
          starts_at: string
          ends_at: string
          is_active: boolean
          impressions: number
          clicks: number
          created_at: string
        }
        Insert: {
          vendor_id?: string | null
          title: string
          description?: string | null
          cta_text?: string
          cta_url: string
          placement: 'homepage_banner' | 'kb_sidebar' | 'directory_featured' | 'article_inline'
          image_url?: string | null
          price_per_month: number
          currency?: string
          starts_at: string
          ends_at: string
          is_active?: boolean
        }
        Update: {
          vendor_id?: string | null
          title?: string
          description?: string | null
          cta_text?: string
          cta_url?: string
          placement?: 'homepage_banner' | 'kb_sidebar' | 'directory_featured' | 'article_inline'
          image_url?: string | null
          price_per_month?: number
          currency?: string
          starts_at?: string
          ends_at?: string
          is_active?: boolean
          impressions?: number
          clicks?: number
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type: string
          title: string
          message: string
          data: Json
          read: boolean
          created_at: string
        }
        Insert: {
          user_id?: string | null
          type: string
          title: string
          message: string
          data?: Json
          read?: boolean
        }
        Update: {
          read?: boolean
        }
      }
      vendor_events: {
        Row: {
          id: string
          vendor_id: string
          event_type: 'view' | 'rfq_received' | 'rfq_dispatched' | 'quote_sent'
          metadata: Json
          created_at: string
        }
        Insert: {
          vendor_id: string
          event_type: 'view' | 'rfq_received' | 'rfq_dispatched' | 'quote_sent'
          metadata?: Json
        }
        Update: Record<string, never>
      }
    }
    Views: Record<string, never>
    Functions: {
      get_admin_stats: {
        Args: Record<string, never>
        Returns: Array<{
          total_rfqs: number
          new_rfqs: number
          dispatched_rfqs: number
          total_vendors: number
          verified_vendors: number
          pending_vendors: number
          total_articles: number
          published_articles: number
          mrr_inr: number
          active_memberships: number
        }>
      }
      increment_vendor_views: {
        Args: { p_id: string }
        Returns: void
      }
      increment_vendor_rfq_count: {
        Args: { p_id: string }
        Returns: void
      }
    }
    Enums: Record<string, never>
  }
}

// Convenience row types
export type Profile     = Database['public']['Tables']['profiles']['Row']
export type Vendor      = Database['public']['Tables']['vendors']['Row']
export type RFQ         = Database['public']['Tables']['rfqs']['Row']
export type RFQResponse = Database['public']['Tables']['rfq_responses']['Row']
export type Article     = Database['public']['Tables']['articles']['Row']
export type Membership  = Database['public']['Tables']['memberships']['Row']
export type AdPlacement = Database['public']['Tables']['ad_placements']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type VendorEvent = Database['public']['Tables']['vendor_events']['Row']
