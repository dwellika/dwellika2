# Dwellika — Indian Art Marketplace Platform

Dwellika is a full-stack SaaS marketplace for Indian artists, collectors, and art-supply sellers. It combines a curated artwork gallery, short-form video reels, live competitions, structured courses, live workshops, direct messaging, and a community hub — all in one platform.

---

## Table of Contents

- [Live Demo & Accounts](#live-demo--accounts)
- [Feature Overview](#feature-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Authentication & Roles](#authentication--roles)
- [Architecture Notes](#architecture-notes)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Scripts Reference](#scripts-reference)
- [Developer Guide](#developer-guide)

---

## Live Demo & Accounts

All demo accounts use the password **`Demo@1234`**

| Email | Role | Profile |
|---|---|---|
| `admin@dwellika.com` | Admin | Vikram Nair — full platform access, admin panel |
| `artist1@dwellika.com` | Artist (Professional) | Priya Sharma — verified watercolorist, Jaipur |
| `artist2@dwellika.com` | Artist (Creator) | Kiran Mehta — abstract painter, Bangalore |
| `seller@dwellika.com` | Seller | Raj Kumar — Raj Art Supplies, Delhi |
| `user@dwellika.com` | User | Arjun Singh — art collector, Pune |
| `meera@dwellika.com` | User | Meera Iyer — course graduate, Chennai |

Sign in at `/signin`. Each role unlocks a different dashboard and feature set — try all of them to explore the full platform.

---

## Feature Overview

### Public (no account required)
- Browse the artwork gallery, artist profiles, and curated collections
- Watch the short-form art reels feed at `/reels`
- View live competitions, upcoming workshops, and ongoing courses
- Browse the art supplies / home décor shop

### User (collector / buyer)
- Follow artists and receive personalised AI recommendations
- Save artworks to named collections and a wishlist
- Add to cart and pay via Razorpay or Stripe
- Track orders with full shipping history
- Leave verified purchase reviews
- Enrol in courses and attend workshops
- Join communities, post, and vote in polls
- Direct message artists and sellers
- Earn XP and unlock badges through engagement

### Artist
- Everything a user can do, plus:
- Upload artworks with detailed metadata (medium, style, dimensions, edition size)
- Offer prints and set commission availability
- Post short-form reels (process videos, timelapses)
- Enter competitions and view vote counts in real time
- Create and sell video courses
- Host live workshops (with Zoom/Meet link)
- View earnings, followers, and engagement stats on `/artist/dashboard`

### Seller
- Everything a user can do, plus:
- List products across three categories: Home Décor, Art Supplies, Wearing Arts
- Manage inventory, orders, and payouts from `/seller/dashboard`
- GST + PAN verification upload flow
- Handle disputes and communicate with buyers

### Admin
- Full platform access, plus:
- `/admin/users` — manage users, change roles, verify accounts
- `/admin/moderation` — review and approve/reject submitted content
- `/admin/competitions` — create and manage competitions
- `/admin/sellers` — seller verification document review
- `/admin/analytics` — platform-wide analytics dashboard
- `/admin/disputes` — dispute resolution centre
- `/admin/orders` — order oversight and intervention

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React Server Components, Server Actions) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui (Radix primitives) |
| Primary Database | PostgreSQL on Railway via Prisma ORM v5 |
| Analytics Database | MongoDB Atlas (reels analytics + recommendations only) |
| Auth | NextAuth v5 (beta.31) — JWT strategy, no adapter |
| File Storage | Cloudinary (images and videos) |
| Payments | Razorpay (India) + Stripe (international) |
| AI | OpenAI API (recommendations, artwork tagging, smart search) |
| Animation | Framer Motion |
| Forms | React Hook Form + Zod validation |
| Client State | Zustand (cart, UI state) |
| Data Fetching | TanStack Query v5 |
| Charts | Recharts (admin analytics, dynamically imported) |

---

## Project Structure

```
dwellika/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth pages (sign-in, sign-up, forgot password)
│   ├── (legal)/                      # Static pages (privacy, terms, refund policy)
│   ├── (marketing)/                  # Landing / about pages
│   ├── (pages)/                      # Main product pages
│   │   ├── artists/                  # /artists — artist directory
│   │   ├── cart/                     # /cart — shopping cart
│   │   ├── checkout/                 # /checkout — Razorpay / Stripe payment flow
│   │   ├── collections/              # /collections — curated artwork collections
│   │   ├── communities/              # /c — community hub
│   │   ├── competitions/             # /competitions — contest listing & detail pages
│   │   ├── courses/                  # /courses — learning hub
│   │   ├── discover/                 # /discover — AI-powered discovery feed
│   │   ├── reels/                    # /reels — fullscreen TikTok-style video feed
│   │   ├── shopping/                 # /shopping — product marketplace
│   │   ├── wishlist/                 # /wishlist — saved artworks
│   │   └── workshops/                # /workshops — live session listings
│   ├── admin/                        # /admin — admin panel (admin role only)
│   │   ├── analytics/
│   │   ├── communities/
│   │   ├── competitions/
│   │   ├── disputes/
│   │   ├── moderation/
│   │   ├── orders/
│   │   ├── sellers/
│   │   └── users/
│   ├── artist/                       # /artist/dashboard — artist dashboard
│   ├── artworks/[slug]/              # Artwork detail page
│   ├── products/[slug]/              # Product detail page
│   ├── seller/                       # /seller/dashboard — seller dashboard
│   ├── u/[username]/                 # Public user/artist profile
│   ├── orders/                       # /orders — buyer order history & tracking
│   ├── messages/                     # /messages — direct messaging
│   ├── notifications/                # /notifications — notification centre
│   ├── settings/                     # /settings — account settings
│   ├── disputes/                     # /disputes — dispute centre
│   ├── 403/                          # Forbidden page
│   ├── api/
│   │   ├── auth/[...nextauth]/       # NextAuth route handler
│   │   ├── ai/                       # AI recommendations & search
│   │   ├── chat/[chatId]/            # Chat messages
│   │   ├── checkout/                 # Payment intent creation
│   │   ├── newsletter/               # Newsletter subscription
│   │   ├── notifications/            # Push notification handler
│   │   ├── razorpay/                 # Razorpay webhook
│   │   ├── reels/                    # Reel feed, view events, comments
│   │   ├── stripe/                   # Stripe webhook
│   │   └── user/                     # Profile update endpoint
│   ├── layout.tsx                    # Root layout (Navbar, Footer, providers)
│   ├── page.tsx                      # Homepage (Hero, Trending, Competitions, etc.)
│   ├── globals.css                   # Global CSS + design tokens
│   ├── sitemap.ts                    # Auto-generated sitemap.xml
│   └── robots.ts                     # robots.txt
│
├── components/
│   ├── ai/                           # RecommendationsRail, AI-powered search
│   ├── artists/                      # ArtistCard, ArtistProfile, ArtistGrid
│   ├── artworks/                     # ArtworkCard, ArtworkGrid, Lightbox
│   ├── auth/                         # SignInForm, SignUpForm, OAuthButtons
│   ├── badges/                       # BadgeGrid, BadgeTooltip
│   ├── charts/                       # Admin analytics charts (Recharts, code-split)
│   ├── checkout/                     # CheckoutForm, OrderSummary, PaymentMethods
│   ├── comments/                     # CommentThread, CommentInput (threaded)
│   ├── communities/                  # CommunityCard, PostFeed, PollBlock
│   ├── competitions/                 # CompetitionCard, SubmissionGallery, VoteButton
│   ├── home/                         # All homepage section components
│   │   ├── Hero.tsx
│   │   ├── TrendingArtists.tsx
│   │   ├── LiveCompetitions.tsx
│   │   ├── FeaturedReels.tsx
│   │   ├── UpcomingWorkshops.tsx
│   │   └── ...
│   ├── layout/                       # Navbar, Footer, MobileNav, UserMenu
│   ├── products/                     # ProductCard, ProductGrid
│   ├── pwa/                          # OfflineIndicator, InstallPrompt
│   ├── reviews/                      # ReviewCard, StarRating, ReviewForm
│   ├── seo/                          # StructuredData, OpenGraph helpers
│   ├── shop/                         # CartDrawer, AddToCartButton
│   ├── social/                       # FollowButton, LikeButton, ShareMenu
│   └── ui/                           # shadcn/ui base primitives
│
├── lib/
│   ├── auth/
│   │   ├── config.ts                 # Full NextAuth config (Node.js only)
│   │   ├── edge-config.ts            # Stripped config for middleware (Edge safe)
│   │   ├── rbac.ts                   # getCurrentUser, requireRole, requireSelf
│   │   └── use-user.ts               # Client hook: useUser()
│   ├── api/
│   │   └── auth.ts                   # API guards: requireApiAuth, requireApiRole
│   ├── data/                         # Server-side data access (Prisma queries)
│   │   ├── artists.ts
│   │   ├── artworks.ts
│   │   ├── competitions.ts
│   │   ├── products.ts
│   │   ├── reels.ts
│   │   └── ...                       # One file per domain
│   ├── reels/
│   │   └── analytics.ts              # MongoDB reel scoring + feed ranking
│   ├── types/
│   │   └── database.ts               # AppRole enum, shared TypeScript types
│   ├── mock/                         # Mock fixtures (homepage fallbacks)
│   ├── mongodb.ts                    # Lazy MongoDB client (analytics only)
│   ├── prisma.ts                     # Prisma client singleton
│   └── utils.ts                      # cn(), formatCurrency(), date helpers
│
├── prisma/
│   ├── schema.prisma                 # Full PostgreSQL schema (40+ models)
│   └── seed.ts                       # Demo data seed script
│
├── types/
│   └── next-auth.d.ts                # NextAuth session & JWT type augmentation
│
├── middleware.ts                     # Route-level RBAC + auth redirects
├── next.config.mjs                   # Images, security headers, bundle optimizations
├── tailwind.config.ts                # Tailwind theme and design tokens
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js 18+** (developed on Node 24; Vercel deploys on Node 18/20)
- **npm 9+**
- A **Railway PostgreSQL** database (free tier works)
- A **MongoDB Atlas** cluster (free tier works; used for reel analytics only)
- A **Cloudinary** account (free tier for image/video uploads)

### 1. Clone and install

```bash
git clone https://github.com/your-org/dwellika.git
cd dwellika
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all required values. See the [Environment Variables](#environment-variables) section for what each one does.

> **Security:** Real credentials go into `.env.local` only — it is gitignored and must never be committed. The `.env` file holds only the `DATABASE_URL` needed by Prisma CLI tooling (same value as `.env.local`).

### 3. Push the database schema

```bash
npm run db:push
```

This syncs `prisma/schema.prisma` to your Railway PostgreSQL instance without deleting any existing data.

### 4. Seed demo data

```bash
npm run db:seed
```

This populates the database with 6 demo accounts, artworks, products, reels, communities, competitions, courses, workshops, orders, and more. See [Live Demo & Accounts](#live-demo--accounts) for credentials.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in each value.

### Required — app will not start without these

| Variable | How to get it |
|---|---|
| `DATABASE_URL` | Railway → your PostgreSQL service → Connect → connection string |
| `AUTH_SECRET` | Run `openssl rand -base64 32` in your terminal |
| `NEXTAUTH_URL` | `http://localhost:3000` for development; your production domain for production |

### Strongly recommended

| Variable | How to get it |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → your cluster → Connect → connection string. If unset, reels feed falls back to chronological order. |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard → Settings → Cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard → Settings → API Keys |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Same as `CLOUDINARY_CLOUD_NAME` (exposed to browser for upload widget) |

### Payments

| Variable | Where to get it |
|---|---|
| `RAZORPAY_KEY_ID` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Webhooks → create webhook, copy secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → your endpoint secret |

### OAuth (optional — email/password works without these)

| Variable | Where to get it |
|---|---|
| `GOOGLE_CLIENT_ID` | Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | Same as above |
| `GITHUB_CLIENT_ID` | GitHub → Settings → Developer settings → OAuth Apps |
| `GITHUB_CLIENT_SECRET` | Same as above |

For OAuth to work in development, add `http://localhost:3000/api/auth/callback/google` (or `/github`) as an authorised redirect URI in your provider's dashboard.

### AI

| Variable | Where to get it |
|---|---|
| `OPENAI_API_KEY` | platform.openai.com → API Keys |

### App

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Full public URL — used for sitemap generation and OG meta tags |

---

## Database

### Two-database architecture

Dwellika uses two databases with a strict, enforced boundary:

| Database | What it stores |
|---|---|
| **PostgreSQL on Railway (Prisma ORM)** | Everything: users, auth, artworks, products, orders, communities, competitions, courses, reels metadata, social graph, notifications, chat, gamification |
| **MongoDB Atlas** | Reels analytics only: per-view events, weighted engagement scores, user interest vectors, trending cache with 5-min TTL |

**Rule:** MongoDB is never used for anything that relates to a user account, order, or relational business entity. If you need a new data model, it goes in Prisma (PostgreSQL).

### Schema overview

`prisma/schema.prisma` contains 40+ models:

| Domain | Models |
|---|---|
| Auth | `User`, `Account`, `VerificationToken` |
| Profiles | `ArtistProfile`, `SellerProfile` |
| Content | `Artwork`, `ArtworkMedia`, `Product`, `ProductMedia`, `Reel` |
| Social | `Follow`, `Like`, `Save`, `Comment` |
| Communities | `Community`, `CommunityMember`, `CommunityPost`, `Poll`, `PollOption`, `PollVote` |
| Competitions | `Competition`, `CompetitionSubmission`, `CompetitionVote`, `CompetitionWinner` |
| Learning | `Course`, `CourseLesson`, `CourseEnrollment`, `CourseCertificate`, `LessonProgress`, `Workshop`, `WorkshopRegistration` |
| Commerce | `Address`, `Order`, `OrderItem`, `OrderTrackingEvent`, `Review`, `Dispute`, `DisputeMessage` |
| Chat | `Chat`, `ChatParticipant`, `ChatMessage` |
| Gamification | `Badge`, `UserBadge`, `UserXp` |
| Platform | `Notification`, `Announcement`, `Testimonial`, `ModerationLog`, `NewsletterSubscriber`, `SellerVerificationDoc` |

### Enums

`AppRole`, `ArtistTier`, `UserLevel`, `ContentStatus`, `OrderStatus`, `ProductCategory`, `CompetitionStatus`, `CourseLevel`, `NotificationKind`, `ReactionTarget`, `ReviewTarget`, `CommunityRole`, `ChatKind`, `MediaKind`, `AnnouncementCategory`, `TestimonialGroup`, `DisputeStatus`

---

## Authentication & Roles

### How it works

- **JWT strategy** — no database sessions. Tokens are signed with `AUTH_SECRET`.
- **Token refresh** — the database is queried at most once every 15 minutes per active session. This propagates role changes (e.g. a user being promoted to `artist`) within 15 minutes without forcing re-login.
- **Edge-safe split** — `lib/auth/edge-config.ts` is a minimal NextAuth config used only by `middleware.ts`. It contains no `bcryptjs` or Prisma imports, so it runs on Vercel Edge Runtime without errors. The full `lib/auth/config.ts` runs in the Node.js runtime.
- **OAuth** — Google and GitHub are supported when their env vars are set. OAuth sign-ins upsert the user row in PostgreSQL and link the account record.

### Roles and what they unlock

| Role | Middleware prefix | What they can access |
|---|---|---|
| `user` | (any authenticated) | Cart, orders, checkout, wishlist, messages, notifications, settings, communities |
| `artist` | `/artist/dashboard` | Artist dashboard + all user routes |
| `seller` | `/seller/dashboard` | Seller dashboard + all user routes |
| `admin` | `/admin` | Admin panel + everything else |
| `super_admin` | `/admin` | Same as admin (reserved for future elevated permissions) |

### Server-side auth helpers

```typescript
// lib/auth/rbac.ts

import { getCurrentUser, requireRole, requireSelf } from "@/lib/auth/rbac"

// Get current user — returns null if not logged in
const user = await getCurrentUser()

// Require a specific role — redirects to /403 if wrong role, /signin if not logged in
const user = await requireRole("admin", "super_admin")

// Protect user-owns-resource routes — redirects to /403 if userId doesn't match session
await requireSelf(targetUserId)

// Utility checks
import { canModerate, isCreatorRole } from "@/lib/auth/rbac"
canModerate(user)    // true for admin / super_admin
isCreatorRole(user)  // true for artist / admin
```

### API route auth helpers

```typescript
// lib/api/auth.ts

import { requireApiAuth, requireApiRole, isApiSession } from "@/lib/api/auth"

export async function POST(req: Request) {
  // Returns 401 JSON if not authenticated
  const session = await requireApiAuth()
  if (!isApiSession(session)) return session

  // Returns 403 JSON if wrong role
  const session = await requireApiRole("admin", "super_admin")
  if (!isApiSession(session)) return session

  // session.user is now typed with id, role, username, etc.
}
```

### Client-side hook

```typescript
import { useUser } from "@/lib/auth/use-user"

function MyComponent() {
  const { user, isLoading } = useUser()
  if (isLoading) return <Spinner />
  if (!user) return <SignInPrompt />
  return <p>Welcome, {user.full_name}</p>
}
```

---

## Architecture Notes

### ISR + DB build resilience

Pages with `export const revalidate = 60` are prerendered at build time (ISR). Any Prisma call in these pages **must** have a `.catch()` fallback, otherwise the build fails when Railway is unreachable during CI/CD:

```typescript
// ✅ Build-safe
const { artists } = await listArtists({ limit: 8 }).catch(() => ({ artists: [], count: 0 }))

// ❌ Crashes the build if Railway is unreachable
const { artists } = await listArtists({ limit: 8 })
```

### Lazy MongoDB connection

`lib/mongodb.ts` never calls `client.connect()` at module import time. The connection is deferred to the first `getDb()` call. This prevents SSL/TLS errors during Next.js static page generation (a known issue with MongoDB driver + OpenSSL 3.x).

### Edge Runtime boundary

Vercel Edge Runtime does not support Node.js built-ins like `crypto` (in the way `bcryptjs` uses them).

- `lib/auth/edge-config.ts` → middleware only, no bcryptjs or Prisma
- `lib/auth/config.ts` → API routes and server components, full Node.js

Always add `export const runtime = "nodejs"` to any API route that imports `config.ts` or `bcryptjs`.

### Reels feed ranking algorithm

MongoDB `reel_scores` are computed with a 7-signal weighted formula:

```
score = (avgCompletion × 0.30)
      + (likes/views    × 0.22)
      + (shares/views   × 0.16)
      + (comments/views × 0.10)
      + (saves/views    × 0.10)
      + (buyClicks/views × 0.08)
      + (followClicks/views × 0.04)
      + (completionRate × 0.10)
      + (log(views)     × 0.05)
```

Trending cache expires after 300 seconds (MongoDB TTL index). User interest vectors personalise the feed per session.

### Server Actions vs API Routes

| Use case | Solution |
|---|---|
| Form submission, button mutation in a React component | Server Action in `lib/data/*-actions.ts` |
| Webhook receiver (Razorpay, Stripe) | API Route in `app/api/` |
| Client-side `fetch` (reel events, chat) | API Route in `app/api/` |
| Third-party OAuth callback | API Route (handled by NextAuth) |

---

## API Reference

| Route | Method | Auth required | Description |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | — | Sign in, sign out, OAuth callback (NextAuth) |
| `/api/user/profile` | PATCH | Any logged-in user | Update bio, avatar, username |
| `/api/reels/feed` | GET | Optional | Ranked reel feed (MongoDB scoring + personalisation) |
| `/api/reels/[id]/view` | POST | Optional | Track a reel view / engagement event |
| `/api/reels/[id]/comments` | GET | — | Paginated reel comments |
| `/api/reels/[id]/comments` | POST | Auth | Post a comment on a reel |
| `/api/ai/recommendations` | GET | Optional | Personalised artwork recommendations (OpenAI) |
| `/api/chat/[chatId]` | GET | Auth | Fetch message history for a chat |
| `/api/chat/[chatId]` | POST | Auth | Send a message |
| `/api/checkout/razorpay` | POST | Auth | Create a Razorpay order |
| `/api/checkout/stripe` | POST | Auth | Create a Stripe payment intent |
| `/api/razorpay/webhook` | POST | Webhook signature | Payment confirmed → update order status |
| `/api/stripe/webhook` | POST | Webhook signature | Stripe event handler |
| `/api/newsletter` | POST | — | Subscribe an email to the newsletter |
| `/api/notifications/push` | POST | Auth | Send a push notification to a user |

---

## Deployment

### Vercel (recommended)

1. Push your repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. In **Settings → Environment Variables**, add every variable from `.env.local`
4. Set `NEXTAUTH_URL` to your production domain (e.g. `https://dwellika.in`)
5. Set **Node.js Version** to 18.x or 20.x in **Settings → General**
6. Click **Deploy**

After the first deploy, set up webhooks:
- **Razorpay:** Dashboard → Webhooks → `https://dwellika.in/api/razorpay/webhook`
- **Stripe:** Dashboard → Developers → Webhooks → `https://dwellika.in/api/stripe/webhook`

### Security headers

These are applied automatically to every response via `next.config.mjs`:

```
X-Content-Type-Options:     nosniff
X-Frame-Options:            DENY
X-XSS-Protection:           1; mode=block
Referrer-Policy:            strict-origin-when-cross-origin
Permissions-Policy:         camera=(), microphone=(), geolocation=(self)
Strict-Transport-Security:  max-age=31536000; includeSubDomains
```

### Railway (database)

No special configuration needed beyond the connection string. Prisma connects over the standard PostgreSQL wire protocol. The database is already on Railway's private network when deployed on Railway itself, or reachable via the proxy URL from Vercel.

---

## Scripts Reference

```bash
# Development
npm run dev           # Start dev server at http://localhost:3000
npm run build         # Production build (runs type-check + compilation)
npm run start         # Start the production build locally
npm run lint          # Run ESLint

# Database
npm run db:generate   # Regenerate Prisma client after schema changes (always run after editing schema.prisma)
npm run db:push       # Sync schema to Railway without data loss
npm run db:seed       # Run the seed script (adds demo data; safe on empty DB)
npm run db:reset      # Force-reset schema + reseed — DESTROYS ALL DATA
npm run db:migrate    # Run pending Prisma migrations (for production deploys)
npm run db:studio     # Open Prisma Studio (visual DB browser) at http://localhost:5555
```

---

## Developer Guide

### Adding a new page

1. Create `app/(pages)/your-feature/page.tsx`
2. Use `export const revalidate = 60` for ISR (SEO-friendly, cached)
3. Or `export const dynamic = "force-dynamic"` for fully dynamic (e.g. personalised pages)
4. Always add `.catch(() => fallback)` on every Prisma call in ISR pages

```typescript
// Example ISR page
export const revalidate = 60

export default async function YourPage() {
  const items = await listItems({ limit: 20 }).catch(() => [])
  return <ItemGrid items={items} />
}
```

### Adding a new API route

1. Create `app/api/your-domain/route.ts`
2. Add `export const runtime = "nodejs"` if you use Prisma or bcryptjs
3. Guard with auth helpers from `lib/api/auth.ts`

```typescript
export const runtime = "nodejs"

import { requireApiAuth, isApiSession } from "@/lib/api/auth"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const session = await requireApiAuth()
  if (!isApiSession(session)) return session // 401/403 Response

  const body = await req.json()
  // ...do work...
  return NextResponse.json({ ok: true })
}
```

### Adding a Prisma model

1. Edit `prisma/schema.prisma` — add your model following the snake_case convention with `@@map("table_name")`
2. Run `npm run db:push` to sync the schema to Railway
3. Run `npm run db:generate` to regenerate the Prisma client
4. Create a data access file at `lib/data/your-domain.ts`
5. Add seed rows to `prisma/seed.ts` if useful for development

### Role-protecting a server component

```typescript
import { requireRole } from "@/lib/auth/rbac"

export default async function AdminPage() {
  // Redirects to /signin or /403 automatically
  const user = await requireRole("admin", "super_admin")

  return <AdminDashboard user={user} />
}
```

### Role-protecting an API route

```typescript
import { requireApiRole, isApiSession } from "@/lib/api/auth"

export async function DELETE(req: Request) {
  const session = await requireApiRole("admin")
  if (!isApiSession(session)) return session

  // session.user.id, session.user.role available here
}
```

### Working with MongoDB (reels analytics only)

```typescript
import { safeDb } from "@/lib/mongodb"

// safeDb() returns null if MongoDB is unreachable — always handle the null case
const db = await safeDb()
if (!db) return fallbackData

const scores = await db.collection("reel_scores").find({}).toArray()
```

### Adding a new section to the homepage

1. Create `components/home/YourSection.tsx` as a **server component** (no `"use client"` unless you need interactivity)
2. Fetch data inside the component using `lib/data/*.ts` functions with `.catch()` fallbacks
3. Import and add `<YourSection />` to `app/page.tsx`

```typescript
// components/home/YourSection.tsx
import { listYourData } from "@/lib/data/your-domain"

export async function YourSection() {
  const data = await listYourData({ limit: 6 }).catch(() => [])
  if (!data.length) return null
  return (
    <section className="container-page py-16">
      {/* ... */}
    </section>
  )
}
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes and test locally (`npm run dev`)
4. Run `npm run lint` and `npm run build` — fix any errors before pushing
5. Open a pull request against `main`

**Commit format:** `feat:`, `fix:`, `refactor:`, `docs:`, `chore:` (conventional commits)

**Branch naming:** `feat/`, `fix/`, `chore/` + kebab-case description

**Do not commit:**
- `.env.local` or any file containing real credentials
- `.next/` build output
- `node_modules/`
