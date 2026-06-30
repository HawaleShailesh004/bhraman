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

## Demo accounts

After seeding, these emails exist in the database:

| Role | Email | How to sign in |
|------|-------|----------------|
| **Traveler** | `demo@bhraman.app` | `/sign-up` or `/sign-in` with Clerk (same email) |
| **Operator** | `sahyadri-trails@example.com` | `/operator/sign-up` first, then `/operator/sign-in` |

**Operator sign-up tips:**
1. Use the exact operator email above (or other `slug@example.com` from seed)
2. If Clerk asks for a verification code in dev, enter **`424242`**
3. After sign-up you are redirected to sign-in, then `/operator`

Other operator emails: `konkan-wave-adventures@example.com`, `maval-adventure-co@example.com`, etc.

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
