# Bhraman

Maharashtra's trust-first adventure marketplace — discover verified treks, camps, and water sports, plan trips with AI, and book with Razorpay.

## Stack

- **Next.js 14** (App Router)
- **Prisma** + **Neon Postgres**
- **Clerk** authentication
- **Anthropic** AI planner
- **Razorpay** payments

## Local development

```bash
npm install
cp .env.example .env   # fill in values
npx prisma db push
npm run db:seed
npm run db:images
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (after seed)

| Role | Email |
|------|-------|
| Traveler | `demo@bhraman.app` |
| Operator | `sahyadri-trails@bhraman-operators.demo` |

With Clerk enabled, sign in using these emails to link existing DB users.

## Deploy on Vercel

1. Push this repo to GitHub and **Import** in [Vercel](https://vercel.com).
2. Set **Root Directory** to `.` (default).
3. Add environment variables from `.env.example`.
4. Use a **pooled** Neon connection string for `DATABASE_URL` in production.
5. After first deploy, run once locally (or via CI):

   ```bash
   npx prisma db push
   npm run db:seed
   npm run db:images
   ```

6. In Clerk dashboard, set paths to `/sign-in` and `/sign-up`, and add your Vercel domain.

### Required env vars (production)

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon Postgres |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk |
| `CLERK_SECRET_KEY` | Clerk |
| `ANTHROPIC_API_KEY` | AI planner |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Payments |
| `RAZORPAY_WEBHOOK_SECRET` | Payment webhooks |
| `CRON_SECRET` | Vercel cron auth (auto-set on Vercel) |

## Project structure

```
public/           Static assets (hero video, favicons)
src/app/          Next.js routes and API
src/components/   UI by feature
src/lib/          Server utilities
prisma/           Schema, seed, listing image data
tools/wikimedia/  One-off image pipeline scripts (dev only)
docs/             Engineering notes
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:seed` | Seed listings and operators |
| `npm run db:images` | Attach hero images to listings |

## License

Private — hackathon project.
