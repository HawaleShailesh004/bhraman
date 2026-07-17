# Bhraman — Production Build Plan
### From hackathon demo to real-operator-ready, in a few weeks

This maps every gap from the root-cause research onto your actual Prisma schema and page list, sequenced so your dev can execute in order. Written against what you confirmed: Bucket 1 (non-negotiable trust/safety) + category-flexible attributes (scoped to real operators) + operator CRM view, pulled into the launch window.

---

## Part 1 — Schema migrations (do these first, everything else depends on them)

### 1.1 Operator model — add trust fields

```prisma
model Operator {
  // ...existing fields...

  yearsOperating       Int?
  panNumber            String?
  gstNumber            String?
  mtdcRegistrationNo   String?      // Ministry of Tourism / MTDC number, if any
  insuranceStatus      Boolean      @default(false)
  insuranceProvider    String?
  insuranceDetails     String?      // free text, coverage summary
  femaleGuideCount     Int          @default(0)
  totalGuideCount      Int          @default(0)
  posHPolicyStatus     PosHStatus   @default(NOT_STARTED)   // enum: NOT_STARTED, IN_PROGRESS, COMPLETE
  verificationStatus   VerificationStatus @default(UNVERIFIED) // UNVERIFIED, PENDING, VERIFIED
  verifiedAt           DateTime?
  phoneVerified        Boolean      @default(false)
}

enum PosHStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETE
}

enum VerificationStatus {
  UNVERIFIED
  PENDING
  VERIFIED
}
```

**Why each field, tied to root cause:**
- `yearsOperating`, `panNumber`, `gstNumber`, `mtdcRegistrationNo` — baseline legitimacy signal, solves the trust-deficit root cause. None of these need to be mandatory to launch; a null value just means "unverified," which is honest.
- `insuranceStatus/Provider/Details` — the latent-scandal-prevention field. Even a simple yes/no + text field is worth more than nothing, and it's nearly free to add now vs. retrofitting after 50 operators are live.
- `femaleGuideCount`/`totalGuideCount` — powers the female-safety trust signal on operator profile ("3 of 8 guides are women").
- `posHPolicyStatus` — track it as a status, not a boolean, because most operators will be "not started" at launch — you want the field to exist so you can push them toward "in progress" over time, not silently omit it.
- `verificationStatus` — this is the field your "Verified" badge reads from. Gate it behind actual checks (PAN present + phone verified + at least one completed batch), don't just auto-verify everyone — that defeats the entire point.

### 1.2 Listing model — flexible category attributes

```prisma
model Listing {
  // ...existing fields...

  category        Category  @relation(...)  // already exists
  attributes      Json?     // category-specific key-value data
}
```

Scope `attributes` to only the categories your real operators run — don't build all 8 templates speculatively. Based on your cofounder's meeting tomorrow, you'll know which 2-3 categories to actually template. Example shape for Trekking (build this one first, it's your primary vertical):

```json
{
  "peakOrLocation": "Kalsubai",
  "elevationMeters": 1646,
  "distanceKm": 8.5,
  "elevationGainMeters": 900,
  "terrainType": "rocky",
  "nightTrek": true,
  "permitRequired": true,
  "bestSeason": ["Oct", "Nov", "Dec", "Jan", "Feb"]
}
```

Add a second template (e.g. Camping or Water Sports) only once you know a real operator needs it from tomorrow's meeting — don't guess ahead.

### 1.3 AvailabilitySlot — gender tracking + minimum-seats logic

```prisma
model AvailabilitySlot {
  // ...existing fields...

  maleCount        Int      @default(0)
  femaleCount      Int      @default(0)
  otherCount       Int      @default(0)
  minSeatsToConfirm Int?    // batch needs this many bookings to actually run
  status           SlotStatus @default(OPEN)  // OPEN, FILLING_FAST, CONFIRMED, FULL, CANCELLED, COMPLETED
}

enum SlotStatus {
  OPEN
  FILLING_FAST
  CONFIRMED
  FULL
  CANCELLED
  COMPLETED
}
```

Increment `maleCount`/`femaleCount`/`otherCount` at booking-confirmation time (read from Booking's customer gender field — see 1.5). Display "6 women booked" on the listing/batch page. This is the single cheapest, highest-leverage feature in the entire plan — a few columns and a UI badge, not a subsystem.

`status` auto-transitions: `OPEN` → `FILLING_FAST` (e.g. 70%+ seats filled) → `FULL`. `CONFIRMED` fires once `minSeatsToConfirm` is hit — this is what protects your operators from running an under-filled batch at a loss, directly solving the seat-loss root cause.

### 1.4 Payment/Payout — escrow state machine

This is the most important schema change in the whole plan. Currently your flow is: pay → verify → operator presumably gets paid. That doesn't solve anything — it just digitizes the existing risk transfer.

```prisma
model Payment {
  // ...existing fields...

  escrowStatus     EscrowStatus @default(HELD)
  heldAt           DateTime     @default(now())
  releasedAt       DateTime?
  disputeReason    String?
  disputeStatus    DisputeStatus?
}

enum EscrowStatus {
  HELD          // payment captured, sitting in escrow
  RELEASED      // paid out to operator after trip completion
  REFUNDED      // returned to customer
  DISPUTED      // held pending resolution
}

enum DisputeStatus {
  OPEN
  RESOLVED_OPERATOR
  RESOLVED_CUSTOMER
  RESOLVED_PARTIAL
}
```

**Release logic (the actual mechanism):**
- Razorpay payment succeeds → `escrowStatus = HELD` (not released yet)
- Trip date passes + operator marks batch `COMPLETED` (or auto-completes 24hrs after trip end with no dispute filed) → cron job flips `escrowStatus = RELEASED` → trigger payout
- Customer or operator can file a dispute before release → `escrowStatus = DISPUTED`, payout freezes, you (the platform) manually resolve for now — don't over-build an automated arbitration system yet, a simple admin action is enough at this scale
- Cancellation before trip (per policy) → `REFUNDED`

This is a cron job + a few status fields, genuinely buildable in your timeline, and it's the mechanism that actually changes operator behavior — no more draconian cancellation policies needed on their end, because the platform is holding the risk fairly instead of them holding all of it.

### 1.5 Booking model — CRM-enabling fields + lightweight safety capture

```prisma
model Booking {
  // ...existing fields...

  customerGender        Gender?   // Male, Female, Other, PreferNotToSay
  isRepeatCustomer       Boolean  @default(false)  // computed at booking time
  emergencyContactName   String?
  emergencyContactPhone  String?
  medicalNotes           String?  // simple free text for now, not a structured medical form
}
```

**On the medical/emergency fields — the lightweight version we agreed on:** capture them as simple optional text fields, clearly labeled "shared only with your trek leader for safety," not a structured medical intake form. Don't build role-based access control or encryption-at-rest policy work for this in week one — just don't expose this field in any public API response or on the operator's general booking list view; keep it visible only on the specific trip-day roster the guide sees. Revisit properly (access policy, retention rules) in month 2 once you have real data flowing and can see actual usage patterns.

`isRepeatCustomer` — compute this at booking time by checking if `customerPhone` or `customerEmail` has a prior completed Booking. This one flag is what unlocks the CRM view below.

### 1.6 Review model — fix the link (do this before any real reviews exist)

Change from `User` → `Review` to `Booking` → `Review`:

```prisma
model Review {
  // ...existing fields...
  bookingId    String   @unique
  booking      Booking  @relation(fields: [bookingId], references: [id])
  isVerified   Boolean  @default(true)  // always true if linked to real booking — remove the field entirely if you want, verification is implicit
}
```

Do this migration now, before you have real review data to migrate. This is cheap today and expensive after your first 50 reviews exist under the old model.

---

## Part 2 — New/changed pages

### 2.1 Operator profile page (new, public-facing)

Currently your doc shows no standalone public operator profile route — listings link back to `Place`, not clearly to a trust-rich operator page. Add:

**Route:** `/operators/[slug]`

**Shows:** business name, years operating, verification badge (reads `verificationStatus`), insurance status, female guide count / total guides, total trips conducted (count of completed batches), gallery, about text, all their active listings, aggregate rating from verified reviews only.

This page is where every trust field from 1.1 actually earns its keep. Without this page, all that schema work is invisible to the customer.

### 2.2 Listing detail page — add trust signals inline

On `/listings/[slug]`, add to the existing hero/description/gallery/itinerary/booking-panel layout:
- Operator trust snippet (mini version of 2.1 — verification badge + insurance status + years operating), linking to full operator profile
- Live gender split on the batch/slot selector ("4 women, 6 men booked" next to each available date)
- `minSeatsToConfirm` progress indicator if the batch isn't confirmed yet ("2 more bookings to confirm this trek runs")

### 2.3 Operator dashboard — add CRM view

**Route:** `/operator/customers` (new)

Simple table: customer name, phone, number of past bookings with this operator, last trip date, gender. Sort by "most bookings" to surface repeat customers. This is mostly a query against existing Booking data plus the new `isRepeatCustomer` flag — genuinely low build cost since the data's already being captured, you're just surfacing it.

This directly answers "what do you currently know about your customers?" from the operator research — right now the honest answer is "nothing," and this page is the fix.

### 2.4 Operator dashboard — trust profile completion page

**Route:** `/operator/verification` (new)

A simple form/checklist where operators fill in PAN, insurance details, guide counts, POSH status. Show a completion percentage and explain what unlocks at each stage (e.g., "Add insurance details to get the Verified badge"). This is the progressive-onboarding mechanism from the original schema doc — don't force this at sign-up, surface it as an ongoing nudge in the dashboard instead.

### 2.5 Booking flow — add emergency contact + medical notes step

Add one additional lightweight form step in `/book/[slug]` before Razorpay checkout: emergency contact name/phone (required), medical notes (optional, clearly labeled for safety purposes only). Small addition to an existing flow, not a new page.

### 2.6 Admin — dispute resolution view (minimal)

**Route:** `/admin/disputes` (new, internal only, not operator or traveler facing)

A basic list of `Payment` records where `escrowStatus = DISPUTED`, with a manual resolve action (release to operator / refund to customer / partial). You don't need a polished UI here — this is an internal tool you and your cofounder use directly for the first several months. Build it minimally.

---

## Part 3 — Sequencing for your dev, week by week

**Week 1: Schema + escrow mechanics** ✅ implemented
- All Prisma migrations from Part 1 (1.1–1.6)
- Escrow cron job (release after trip completion / no dispute window)
- Review model fix (do this before real reviews accumulate)
- Safe seat-release sync before expiring pending holds
- Versioned baseline + upgrade migrations under `prisma/migrations/`

**Week 2: Trust-facing pages** ✅ implemented
- Operator profile page (2.1)
- Listing detail trust signals + gender split display (2.2)
- Operator verification/completion page (2.4)

**Week 3: CRM + booking flow additions** ✅ implemented
- Operator CRM view (2.3)
- Emergency contact/medical step in booking flow (2.5)
- Admin dispute view (2.6) — minimal version
- Traveler and operator dispute filing with escrow freeze
- Razorpay-backed full/partial refund resolution and idempotent payout queue
- Restricted trip-roster view for emergency and medical details

**Buffer week: real operator data**
- Once your cofounder's 4-5 operators are contracted, get their real data into the new Operator/Listing fields — this is also your first real test of whether the category-attributes schema (1.2) actually fits how they describe their trips. Expect to adjust the JSON shape once against real operator input, that's normal and fine.

---

## The one thing I want to flag before your dev starts

The escrow mechanism (1.4) is the piece most likely to get quietly simplified under time pressure — it's the least visually exciting thing to build (no new page, just status fields and a cron job) and the easiest to defer "just for the demo." Don't let that happen. Every other trust feature in this plan is cosmetic without it — a verified badge and a gender-split counter don't matter if an operator can still just not deliver and keep the money, or a customer can't get a refund when a trek is rained out. This is the one piece of infrastructure that actually changes the underlying economics from the research, not just the appearance of trust.
