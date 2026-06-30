# Bhraman

**Maharashtra's trust-first adventure marketplace** — discover verified treks, camps, rafting, and fort trails; plan trips with AI; book securely with Razorpay.

Built for [TrailsMate](https://github.com/HawaleShailesh004/bhraman) hackathon. Repo name: `bhraman`.

---

## Features

- **Discover** — 73 curated listings across 50 destinations, filterable by category, difficulty, price, and date
- **Listing detail** — hero image, photo gallery, itinerary, inclusions, weather signal, verified operator block
- **AI planner** — natural-language trip search powered by Anthropic Claude (`/plan`)
- **Booking** — slot selection, group pricing, Razorpay checkout, email confirmation
- **Operator portal** — dashboard, listings, availability, bookings, payouts
- **Real photos** — Wikimedia Commons images per place (hero + gallery)

---

## Quick start

```bash
git clone https://github.com/HawaleShailesh004/bhraman.git
cd bhraman
npm install
cp .env.example .env   # fill in values (see below)
npx prisma db push
npm run db:seed
npm run db:images
npm run dev
```

Open **http://localhost:3000**

### Minimum env for local dev

| Variable | Required for |
|----------|----------------|
| `DATABASE_URL` | Neon Postgres connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Auth (optional — demo mode without Clerk) |
| `CLERK_SECRET_KEY` | Auth |
| `ANTHROPIC_API_KEY` | AI planner |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payments |

See [`.env.example`](.env.example) for the full list.

---

## Demo credentials

| Role | Email | Password |
|------|-------|----------|
| **Operator** | `sahyadri-trails@example.com` | `password` |
| **Traveler** | `demo@bhraman.app` | _(create via `/sign-up`)_ |

These are also shown on **`/operator/sign-in`** and **`/operator/sign-up`**.

---

## How to test the app

### 1. Setup (once)

```bash
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run db:images
npm run dev
```

### 2. Browse as a guest

| Step | URL | What to check |
|------|-----|----------------|
| Home | `/` | Hero, featured listings |
| Discover | `/discover` | Filters, listing cards with photo badges |
| Listing | `/discover` → any card | Hero, gallery strip, itinerary, weather, booking panel |
| AI planner | `/plan` | Chat; ask e.g. “easy trek near Pune this weekend” |

### 3. Test traveler flow

1. Go to **`/sign-up`** and register with `demo@bhraman.app` (or any email)
2. Open a listing → **Reserve now** → **`/book/[slug]`**
3. Pick group size + slot → pay with Razorpay test card
4. Confirm on **`/booking/[ref]`**
5. View history at **`/bookings`**

### 4. Test operator flow (demo account)

**Credentials:** `sahyadri-trails@example.com` / `password`

**First time only — create Clerk account:**

1. **`/operator/sign-up`**
2. Email: `sahyadri-trails@example.com` · Password: `password`
3. Verification code (if prompted): **`424242`**
4. You are redirected to **`/operator/sign-in`** → sign in with same credentials
5. Dashboard: **`/operator`**

**Already registered — sign in:**

1. **`/operator/sign-in`**
2. Use email + password above → **`/operator`**

**From navbar while signed in as traveler:**

1. Click **For Operators** → **`/operator/enter`**
2. Dialog explains you will be signed out as traveler
3. Confirm → **`/operator/sign-in`** with demo credentials shown
4. Sign in as operator

### 5. Operator dashboard

| Page | URL |
|------|-----|
| Overview | `/operator` |
| Bookings | `/operator/bookings` |
| Listings | `/operator/listings` |
| Availability | `/operator/availability` |
| Payouts | `/operator/payouts` |

### 6. Other operator demo emails

`konkan-wave-adventures@example.com`, `maval-adventure-co@example.com`, etc. — same flow; sign up in Clerk first with that exact email.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm run db:seed` | Seed operators, places, listings (idempotent) |
| `npm run db:images` | Attach hero + gallery URLs to listings |
| `npm run db:operators` | Update operator emails only (no full reseed) |
| `npm run db:studio` | Prisma Studio GUI |

---

## Project structure

```
src/app/
  (marketing)/     Landing, about, how-it-works, become-operator
  (app)/           Discover, listings, book, bookings, plan
  operator/        Operator dashboard + auth
  api/             REST routes (bookings, planner, operator, webhooks)
src/components/    UI by feature (discovery, listing, booking, operator)
src/lib/           Auth, listings, payments, AI, images
prisma/            Schema, seed, data JSON, image scripts
public/            Static assets
```

**Architecture details:** see [`architecture.md`](architecture.md)

---

## Deploy (Vercel)

1. Import repo in [Vercel](https://vercel.com)
2. Add all env vars from `.env.example` (use **pooled** Neon URL for `DATABASE_URL`)
3. Deploy, then run once against production DB:

   ```bash
   npx prisma db push
   npm run db:seed
   npm run db:images
   ```

4. **Clerk dashboard:** add production domain; set sign-in `/sign-in`, sign-up `/sign-up`
5. **Razorpay:** configure webhook → `https://your-domain/api/webhooks/razorpay`

---

## Dataset

| Entity | Count |
|--------|------:|
| Operators | 6 |
| Places | 50 |
| Listings | 73 |
| Weekend slots | ~1,460 |

Source: `prisma/data/seed-data.json` (researched Maharashtra adventure destinations).

---

## Tech stack

Next.js 14 · TypeScript · Tailwind CSS · Prisma · PostgreSQL (Neon) · Clerk · Razorpay · Anthropic · Resend · Framer Motion

---

## License

Private — hackathon project.
