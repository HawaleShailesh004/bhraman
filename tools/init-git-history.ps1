$ErrorActionPreference = "SilentlyContinue"
Set-Location (Join-Path $PSScriptRoot "..")

if (Test-Path .git) { Remove-Item -Recurse -Force .git }
git init -b main | Out-Null

function Gc($msg, [string[]]$paths) {
    foreach ($p in $paths) {
        if (Test-Path $p) { & git add -- $p }
    }
    & git commit -m $msg
    if ($LASTEXITCODE -ne 0) { Write-Error "Commit failed: $msg" }
}

Gc "chore: bootstrap next.js app with typescript and tailwind" @(
    "package.json","package-lock.json","tsconfig.json","next.config.mjs",
    "postcss.config.mjs","tailwind.config.ts",".eslintrc.json",".gitignore",".env.example"
)
Gc "feat(db): add prisma schema for marketplace models" @("prisma/schema.prisma")
Gc "feat(db): add maharashtra seed data and catalog" @("prisma/data","prisma/seed.ts","src/lib/seed-catalog.ts")
Gc "feat(lib): add core server utilities and shared types" @(
    "src/lib/prisma.ts","src/lib/slugify.ts","src/lib/format.ts","src/lib/utils.ts",
    "src/lib/fonts.ts","src/lib/filters.ts","src/types/listing.ts","src/types/booking.ts",
    "src/types/planner.ts","src/types/operator.ts"
)
Gc "feat(lib): add booking, availability, and payment logic" @(
    "src/lib/booking.ts","src/lib/availability.ts","src/lib/availability-generator.ts",
    "src/lib/bookings-read.ts","src/lib/email.ts","src/lib/razorpay.ts","src/lib/refunds.ts",
    "src/lib/weather.ts","src/lib/listings.ts","src/lib/operator.ts"
)
Gc "feat(ui): add design system, primitives, and app shell" @(
    "src/app/globals.css","src/app/layout.tsx","src/app/icon.svg","src/app/apple-icon.svg",
    "src/components/ui","src/components/layout/footer.tsx","src/components/layout/navbar.tsx",
    "src/lib/ui-present.ts","src/app/(app)/layout.tsx"
)
Gc "feat(home): add marketing homepage with hero video" @(
    "src/app/(marketing)/page.tsx","src/components/home","public"
)
Gc "feat(marketing): add about, how-it-works, and become-operator pages" @(
    "src/app/(marketing)/about","src/app/(marketing)/how-it-works","src/app/(marketing)/become-operator"
)
Gc "feat(discover): add search filters and listing cards" @("src/app/(app)/discover","src/components/discovery")
Gc "feat(listings): add listing detail pages" @("src/app/(app)/listings","src/components/listing")
Gc "feat(api): add listings, booking, and webhook routes" @(
    "src/app/api/listings","src/app/api/bookings","src/app/api/webhooks","src/app/api/cron"
)
Gc "feat(planner): add ai trip planner with anthropic" @(
    "src/lib/anthropic.ts","src/app/api/planner","src/app/(app)/plan",
    "src/components/planner/planner-client-ui.tsx"
)
Gc "feat(planner): add markdown rendering and thinking animation" @(
    "src/components/planner/planner-markdown.tsx","src/components/planner/planner-thinking.tsx"
)
Gc "feat(booking): add checkout flow and traveler bookings ui" @(
    "src/app/(app)/book","src/app/(app)/booking","src/app/(app)/bookings",
    "src/components/booking","src/components/bookings"
)
Gc "feat(operator): add operator dashboard and management tools" @("src/app/operator","src/components/operator")
Gc "feat(auth): integrate clerk for travelers and operators" @(
    "src/lib/auth.ts","src/lib/clerk-appearance.ts","src/types/auth.ts","src/middleware.ts",
    "src/components/layout/auth-nav.tsx","src/app/sign-in","src/app/sign-up"
)
Gc "feat(images): map wikimedia photos to listings" @(
    "src/lib/listing-images.ts","prisma/attach-listing-images.ts"
)
Gc "chore: add wikimedia dev tools and engineering docs" @("tools/wikimedia","docs")
Gc "chore(deploy): add vercel config and secure cron endpoint" @("vercel.json","package.json")
& git add README.md tools/init-git-history.ps1
& git commit -m "docs: add readme and finalize repository structure"

Write-Host "`n$(git log --oneline | Measure-Object -Line | Select-Object -ExpandProperty Lines) commits:"
git log --oneline
