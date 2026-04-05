# HoistMarket Platform

Production-ready Next.js 15 + Supabase B2B platform for the global lifting equipment industry.

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5.7 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | @supabase/ssr (cookie-based, SSR-safe) |
| Payments | Razorpay |
| Email | Resend |
| Deployment | Vercel |

## Quick Start

```bash
npm install
# Paste lib/schema.sql into Supabase SQL Editor → Run
# Fill .env.local
vercel --prod
```

## .env.local

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://hoistmarket.com
ADMIN_EMAIL=info@hoistmarket.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RESEND_API_KEY=re_xxx
FROM_EMAIL=noreply@hoistmarket.com
```

## Set Admin Role

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## Architecture

- `lib/supabaseClient.ts` — Browser client (`createBrowserClient` from `@supabase/ssr`)
- `lib/supabaseServer.ts` — Server client (`createServerClient` from `@supabase/ssr`)
- `middleware.ts` — Session refresh + route protection
- `lib/actions/index.ts` — Server actions (RFQ, vendor, article management)
- `lib/email/index.ts` — Transactional emails via Resend
