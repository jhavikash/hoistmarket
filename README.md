# HoistMarket — B2B Lifting Equipment Platform

Production-ready Next.js 14 + Supabase platform for the global lifting equipment industry.

## Architecture

| Layer              | Technology                                    |
|--------------------|-----------------------------------------------|
| Framework          | Next.js 14 (App Router, Server Components)    |
| Language           | TypeScript (strict mode)                      |
| Database           | Supabase (PostgreSQL + RLS on every table)    |
| Auth               | Supabase Auth (role-based: admin/vendor/user) |
| Payments           | Razorpay (INR) + webhook verification         |
| Email              | Resend API (6 transactional templates)        |
| Styling            | Tailwind CSS + custom design system           |
| Deployment         | Vercel                                        |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → paste the full contents of `lib/schema.sql` → **Run**
3. This creates all 8 tables, RLS policies, DB functions, indexes, and seeds 6 vendors + 3 articles

### 3. Configure environment variables
Fill in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://hoistmarket.com
ADMIN_EMAIL=info@hoistmarket.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RESEND_API_KEY=re_xxx
FROM_EMAIL=noreply@hoistmarket.com
```

### 4. Run locally
```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel
```bash
vercel --prod
# Add all .env.local values in Vercel dashboard > Settings > Environment Variables
```

### 6. Set your account as admin
In Supabase SQL Editor, after signing up:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### 7. Configure Razorpay webhook
In Razorpay Dashboard → Webhooks → Add:
- URL: `https://hoistmarket.com/api/webhooks/razorpay`
- Events: `payment.captured`, `payment.failed`
- Copy the webhook secret to `RAZORPAY_WEBHOOK_SECRET`

### 8. Configure Supabase Auth redirect URLs
In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://hoistmarket.com`
- Redirect URLs: `https://hoistmarket.com/auth/callback`

---

## File Structure

```
hoistmarket/
├── app/
│   ├── layout.tsx                    # Root layout, fonts, schema.org
│   ├── page.tsx                      # Homepage (SSR from Supabase)
│   ├── globals.css                   # Design system CSS classes
│   ├── sitemap.ts                    # Dynamic XML sitemap
│   ├── robots.ts                     # robots.txt
│   ├── not-found.tsx                 # 404 page
│   ├── error.tsx                     # Error boundary
│   ├── login/page.tsx                # Auth: sign in / sign up / reset
│   ├── dashboard/page.tsx            # User dashboard (RFQ tracking)
│   ├── knowledge-base/
│   │   ├── page.tsx                  # Article index (SSR, no static fallback)
│   │   └── [slug]/page.tsx           # Dynamic article + schema markup
│   ├── directory/
│   │   ├── page.tsx                  # Vendor directory (SSR initial load)
│   │   ├── DirectoryClient.tsx       # Live search + filter via /api/vendors
│   │   └── [slug]/page.tsx           # Vendor profile + LocalBusiness schema
│   ├── equipment/page.tsx            # Equipment hub + FEM spec compare
│   ├── rentals/
│   │   ├── page.tsx                  # Rental marketplace
│   │   └── [slug]/page.tsx           # Programmatic SEO pages (8 markets)
│   ├── news/page.tsx                 # Industry news
│   ├── about/page.tsx                # About + 3-phase business model
│   ├── advertise/page.tsx            # Membership tiers + ad pricing
│   ├── contact/
│   │   ├── page.tsx                  # Contact page
│   │   └── ContactForm.tsx           # Form → /api/contact → Resend email
│   ├── vendor/
│   │   ├── onboard/page.tsx          # 3-step vendor registration
│   │   └── portal/page.tsx           # Vendor dashboard (RFQ inbox, quotes, subscription)
│   ├── admin/
│   │   ├── layout.tsx                # Admin shell (role-protected)
│   │   ├── page.tsx                  # Overview: live KPIs from Supabase
│   │   ├── leads/page.tsx            # RFQ tracker + dispatch engine
│   │   ├── vendors/page.tsx          # Vendor approval + tier management
│   │   ├── content/page.tsx          # Article editor + content calendar
│   │   ├── revenue/page.tsx          # Revenue ledger + commission tracker
│   │   ├── ads/page.tsx              # Ad placement CRUD
│   │   ├── analytics/page.tsx        # Traffic + keyword rankings
│   │   ├── seo/page.tsx              # SEO audit + URL indexing
│   │   └── settings/page.tsx         # Platform configuration
│   ├── api/
│   │   ├── rfq/route.ts              # RFQ: submit, match, dispatch (POST/GET/PUT)
│   │   ├── vendors/route.ts          # Vendor CRUD (GET/POST/PATCH)
│   │   ├── articles/route.ts         # Article CRUD + search (GET/POST/DELETE)
│   │   ├── payments/route.ts         # Razorpay order + verify (POST/PUT)
│   │   ├── contact/route.ts          # Contact form → Resend email
│   │   ├── admin/stats/route.ts      # Dashboard KPIs via Supabase RPC
│   │   └── webhooks/razorpay/route.ts# Webhook: payment.captured → activate membership
│   └── auth/callback/route.ts        # OAuth + magic link handler
├── components/
│   ├── Navbar.tsx                    # Fixed nav with auth state
│   ├── Footer.tsx                    # Full footer
│   ├── RfqForm.tsx                   # 3-step RFQ modal → POST /api/rfq
│   ├── VendorCard.tsx                # Vendor card component
│   ├── SponsoredBanner.tsx           # Dynamic ad placements from DB
│   └── UnitConverter.tsx             # Engineering calculators widget
├── lib/
│   ├── schema.sql                    # Complete DB schema (run this in Supabase)
│   ├── supabaseClient.ts             # Browser + server + admin clients
│   ├── actions/index.ts              # Server actions (submitRFQ, dispatchRFQ, etc.)
│   └── email/index.ts                # Resend email templates (6 types)
├── hooks/
│   └── useAuth.ts                    # useAuth, useRequireAuth, useRequireAdmin
├── utils/
│   └── index.ts                      # formatINR, scoreVendorMatch, FEM calc, etc.
├── types/
│   └── database.ts                   # TypeScript types matching schema.sql exactly
├── middleware.ts                     # Route protection + role-based auth
├── next.config.js                    # Security headers, image domains
├── tailwind.config.ts                # Design tokens (navy, orange, steel)
└── .env.local                        # Environment variables (fill before running)
```

---

## Database Schema (8 tables, all with RLS)

| Table            | Purpose                                              |
|------------------|------------------------------------------------------|
| `profiles`       | User accounts — role: admin/vendor/user. Auto-created on signup via trigger |
| `vendors`        | Directory listings with tier, verified, featured flags |
| `rfqs`           | RFQ submissions with matching engine results         |
| `rfq_responses`  | Vendor quote responses per RFQ                       |
| `articles`       | Knowledge base articles with SEO metadata            |
| `memberships`    | Razorpay-linked subscription records                 |
| `ad_placements`  | Sponsored banner/sidebar placements                  |
| `notifications`  | In-app notifications for vendors and users           |
| `vendor_events`  | Analytics events (view, rfq_received, quote_sent)    |

---

## RFQ Matching Engine

Scoring algorithm in `app/api/rfq/route.ts`:

| Signal                         | Points |
|-------------------------------|--------|
| Exact equipment category match | 50     |
| Partial category match         | 30     |
| Region match                   | 30     |
| Enterprise tier                | 20     |
| Featured tier                  | 15     |
| Standard tier                  | 8      |
| Verified badge                 | 10     |
| Low RFQ count (capacity)       | 5      |

Top 5 scored vendors stored in `matched_vendor_ids`. Admin reviews and dispatches. Vendors receive in-app notification + email.

---

## Revenue Streams

| Stream                        | Where configured                          |
|-------------------------------|-------------------------------------------|
| Vendor memberships (Razorpay) | `/advertise` → `/api/payments`            |
| RFQ broker commissions        | Admin → `/admin/revenue` (manual logging) |
| Sponsored banner ads          | Admin → `/admin/ads`                      |
| KB sidebar ads                | Admin → `/admin/ads`                      |

### Membership Prices
| Plan              | INR/year   | USD/year |
|-------------------|------------|----------|
| Standard          | ₹5,000     | $60      |
| Featured          | ₹18,000    | $216     |
| Enterprise        | ₹60,000    | $720     |

---

## Auth Flow

1. User signs up at `/login` → Supabase creates auth user
2. DB trigger auto-creates `profiles` row with `role = 'user'`
3. Vendor registers at `/vendor/onboard` → role updated to `'vendor'`
4. Admin sets role manually: `UPDATE profiles SET role='admin' WHERE email='...'`
5. `middleware.ts` checks role on every request to `/admin/*`, `/dashboard/*`, `/vendor/portal/*`
6. Login redirects: admin → `/admin`, others → `/dashboard`

---

## Email Templates (Resend API)

| Template                  | Trigger                                |
|--------------------------|----------------------------------------|
| RFQ Confirmation         | On new RFQ submission (to requester)   |
| Admin RFQ Alert          | On new RFQ submission (to admin)       |
| Vendor RFQ Dispatch      | When admin dispatches to vendor        |
| Vendor Approved          | When admin verifies vendor listing     |
| Membership Activated     | On successful Razorpay payment         |
| Contact Form             | On contact form submission             |

All emails have a dev-mode fallback (console.log) when `RESEND_API_KEY` is not set.

---

## SEO Architecture

- **TechnicalArticle** schema on all KB articles
- **LocalBusiness** schema on all vendor profiles  
- **Service** schema on rental market pages
- **WebSite** + SearchAction on root layout
- 8 programmatic rental market pages (`/rentals/[slug]`)
- Dynamic XML sitemap at `/sitemap.xml`
- `robots.ts` configured to block admin/API routes

---

## Support

info@hoistmarket.com · hoistmarket.com
