# Prisma migration rollout

This project used `prisma db push` before migrations were introduced.

For an existing database that already contains the baseline schema:

```bash
npx prisma migrate resolve --applied 20260717000000_baseline
npx prisma migrate deploy
```

For a new empty database, run only:

```bash
npx prisma migrate deploy
```

Back up production before the first rollout. The Week 1 migration deliberately
fails if an existing review cannot be matched to a completed booking, so review
data is never silently discarded.
