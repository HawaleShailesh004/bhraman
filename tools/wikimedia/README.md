# Wikimedia image pipeline (dev only)

Scripts used to build `prisma/data/place-images.json`. Not required for deploy.

Run from repo root, e.g.:

```bash
node tools/wikimedia/fetch-wikimedia-images.mjs
```

Intermediate logs (`*-log.txt`, `wikimedia-raw.json`) are gitignored.
