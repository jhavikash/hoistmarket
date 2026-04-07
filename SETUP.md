# HoistMarket — Complete Setup Guide

## Overview

HoistMarket is a Next.js 15 app with Supabase (database + auth), Razorpay (payments), and Resend (emails). This guide walks you through everything from zero to a live deployed site with working admin.

---

## Step 1: Set Up Supabase (Your Database)

1. Go to **[supabase.com](https://supabase.com)** and create a free account
2. Click **"New Project"**
   - Name: `hoistmarket`
   - Database password: choose a strong password (save it somewhere safe)
   - Region: choose closest to your users (e.g., Mumbai for India)
3. Wait ~2 minutes for the project to provision

### Get Your API Keys

4. Go to **Settings → API** in the Supabase dashboard
5. You'll see three values — copy them:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **anon (public) key**: starts with `eyJhbGciOi...`
   - **service_role key**: starts with `eyJhbGciOi...` (click "Reveal" to see it)

> ⚠️ The service_role key has FULL access to your database. Never expose it in frontend code or GitHub.

### Create Your Tables

6. In Supabase, go to **SQL Editor** (left sidebar)
7. Click **"New query"**
8. Open the file `lib/schema.sql` from your project
9. Copy the ENTIRE contents and paste into the SQL Editor
10. Click **"Run"** — this creates all tables, policies, and functions

You should see a success message. You now have tables for: profiles, vendors, rfqs, rfq_responses, articles, memberships, ad_placements, notifications, and vendor_events.

---

## Step 2: Set Up Environment Variables

### For Local Development

1. In your project folder, copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` in any text editor and fill in your Supabase values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
   ```
3. Save the file

### For Vercel (Production)

**Do NOT upload .env.local to GitHub.** Instead:

1. Go to your project on **[vercel.com](https://vercel.com)**
2. Click **Settings → Environment Variables**
3. Add each variable one by one:
   | Key | Value | Environment |
   |-----|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | All |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | All |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | All |
   | `NEXT_PUBLIC_APP_URL` | `https://hoistmarket.com` | Production |
   | `ADMIN_EMAIL` | `info@hoistmarket.com` | All |

4. Click **"Redeploy"** after adding all variables

---

## Step 3: Create Your Admin Account

1. Go to your deployed site (or localhost:3000) → `/login`
2. Click **"Create account"** and sign up with your email
3. Check your email for the confirmation link and click it
4. Now go to **Supabase Dashboard → Table Editor → profiles**
5. Find your row (search by your email)
6. Click on the `role` cell and change it from `user` to **`admin`**
7. Click **Save**

Now log out and log back in. You'll be redirected to `/admin` automatically.

### What You Can Do as Admin

| Page | What It Does |
|------|-------------|
| `/admin` | Dashboard — see total vendors, RFQs, revenue at a glance |
| `/admin/leads` | View incoming RFQ submissions, dispatch to matching vendors |
| `/admin/vendors` | Approve/reject vendors, verify them, change membership tiers |
| `/admin/content` | Create and edit knowledge base articles, manage content calendar |
| `/admin/revenue` | Track subscription revenue, MRR, export reports to CSV |
| `/admin/ads` | Create and manage sponsored banner ad placements |
| `/admin/seo` | Monitor SEO performance of articles |
| `/admin/settings` | Platform settings (commissions, pricing, email templates) |

---

## Step 4: Deploy to Vercel

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "HoistMarket v8"
   git push origin main
   ```
2. Go to **[vercel.com](https://vercel.com)** → "Import Project"
3. Connect your GitHub repo
4. Vercel auto-detects Next.js — click **Deploy**
5. Add your environment variables in Settings (see Step 2)
6. Redeploy

---

## Step 5: Optional — Razorpay (Payments)

To enable vendor subscription payments:

1. Create a Razorpay account at **[razorpay.com](https://razorpay.com)**
2. Go to **Settings → API Keys** and generate a key pair
3. Add to Vercel environment variables:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   ```
4. Set up a webhook in Razorpay Dashboard → Webhooks:
   - URL: `https://hoistmarket.com/api/webhooks/razorpay`
   - Events: `payment.captured`, `subscription.charged`
   - Copy the webhook secret and add as `RAZORPAY_WEBHOOK_SECRET`

---

## Step 6: Optional — Resend (Emails)

To enable RFQ confirmation and admin alert emails:

1. Create an account at **[resend.com](https://resend.com)**
2. Verify your domain (or use their test domain for dev)
3. Create an API key
4. Add to Vercel:
   ```
   RESEND_API_KEY=re_xxxxx
   FROM_EMAIL=noreply@hoistmarket.com
   ```

---

## Troubleshooting

**"Admin page shows 'unauthorized'"**
→ Make sure your profile's `role` is set to `admin` in Supabase Table Editor

**"No vendors/articles showing up"**
→ The schema.sql includes seed data. Check if the tables have data in Supabase Table Editor

**"Build fails on Vercel"**
→ Make sure ALL environment variables are set in Vercel Settings → Environment Variables

**"Login not working"**
→ In Supabase → Authentication → URL Configuration, add your site URL to "Redirect URLs"

---

## File Structure

```
hoistmarket/
├── app/                    # All pages (Next.js App Router)
│   ├── admin/              # Admin dashboard (9 pages)
│   ├── api/                # API routes (rfq, payments, webhooks, etc.)
│   ├── directory/          # Vendor directory
│   ├── knowledge-base/     # Articles and guides
│   ├── rentals/            # Equipment rental markets
│   ├── vendor/             # Vendor onboarding & portal
│   ├── page.tsx            # Homepage
│   └── layout.tsx          # Root layout
├── components/             # Shared components (Navbar, Footer, RfqForm, etc.)
├── lib/                    # Server utilities (Supabase clients, email, schema)
├── public/                 # Static assets (logo.svg)
├── .env.example            # Template for environment variables
├── .env.local              # YOUR secrets (never commit this!)
└── .gitignore              # Prevents secrets from being pushed
```
