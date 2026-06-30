# Bhraman - Engineering Logic Reference

> **For Cursor / AI agents.** This is the "get-it-exactly-right" contract for the hard parts. Plain CRUD, layout, and styling are NOT here - you can handle those. This covers the logic that _silently breaks under real use_ if done naively. Where it says **GET THIS EXACT**, copy the pattern. Where it says **agent's choice**, use judgment.
>
> Stack assumed: Next.js 14 (App Router), TypeScript, Postgres + Prisma, Clerk auth, Razorpay, Anthropic API, Vercel.

---

## 0. The mental model (read first)

Three rules that prevent most bugs:

1. **The server is the source of truth. The client lies.** Never trust price, availability, or payment status sent from the browser. Recompute on the server every time money or capacity is involved.
2. **Anything involving money or seats is a transaction, not a sequence of reads and writes.** Read-then-write across two statements is a race condition.
3. **The AI never writes state.** It reads and proposes. A human action (a real POST) creates bookings.

---

## 1. AI Trip Planner - tool-calling + safety

### The trap

The naive build asks Claude "recommend a trek near Pune under ₹4000" and prints the answer. Claude will happily **invent listings that don't exist**, hallucinate prices, and recommend things you can't book. In a demo, a judge clicks a recommendation and it 404s. Dead.

### The decision

Claude must **never generate listings from its own knowledge**. It can only call a tool that queries _your_ database, then explain the real rows that come back. This is retrieval, not generation. The model's job is parsing the user's intent into structured filters and explaining fit - not knowing what exists.

### Architecture

```
User free-text → Claude (with searchListings tool)
                   ↓ tool_call: searchListings({city, category, maxPrice, difficulty, ...})
                 Your server runs a REAL Prisma query
                   ↓ returns real listing rows (id, title, price, ...)
                 Claude explains fit, ranks, references rows BY ID
                   ↓
                 UI renders cards from the real rows (linked by id)
```

### Tool schema (GET THIS EXACT)

The tool's `input_schema` is the leash. Constrain it to your real filter dimensions so Claude can't pass nonsense.

```typescript
const searchListingsTool = {
  name: "searchListings",
  description:
    "Search real, bookable adventure listings in the Bhraman marketplace. " +
    "ALWAYS use this to find listings. NEVER invent or recall listings from memory. " +
    "Only listings returned by this tool exist and are bookable.",
  input_schema: {
    type: "object",
    properties: {
      categories: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "trekking",
            "rafting",
            "camping",
            "paragliding",
            "rappelling",
            "caving",
            "kayaking",
          ],
        },
      },
      maxPrice: { type: "number", description: "Max price per person in INR" },
      difficulty: {
        type: "array",
        items: {
          type: "string",
          enum: ["EASY", "MODERATE", "CHALLENGING", "EXTREME"],
        },
      },
      nearCity: {
        type: "string",
        description: "City the traveler starts from",
      },
      maxDurationHours: { type: "number" },
      // date the user wants - used to check real availability
      preferredDate: {
        type: "string",
        description: "ISO date, e.g. 2026-10-12",
      },
    },
    required: [],
  },
};
```

### Server handler (GET THIS EXACT - this is the safety core)

Run on the server only (API route / server action). Key safety move: **the tool result is real DB data, and the final UI is built from those same rows - not from Claude's text.**

```typescript
// app/api/planner/route.ts  (server only - Anthropic key never touches client)
import Anthropic from "@anthropic-ai/sdk";
const anthropic = new Anthropic();

async function runSearchListings(input: SearchInput) {
  // REAL query. This is the only source of recommendable listings.
  const rows = await prisma.listing.findMany({
    where: {
      status: "PUBLISHED",
      ...(input.categories?.length && {
        category: { slug: { in: input.categories } },
      }),
      ...(input.maxPrice && { basePrice: { lte: input.maxPrice } }),
      ...(input.difficulty?.length && { difficulty: { in: input.difficulty } }),
      ...(input.nearCity && {
        place: { city: { contains: input.nearCity, mode: "insensitive" } },
      }),
      ...(input.maxDurationHours && {
        durationHours: { lte: input.maxDurationHours },
      }),
      // only listings with a real open slot on/after the date
      ...(input.preferredDate && {
        slots: {
          some: {
            startTime: { gte: new Date(input.preferredDate) },
            status: "OPEN",
          },
        },
      }),
    },
    include: {
      place: true,
      category: true,
      operator: {
        select: { businessName: true, isVerified: true, ratingAvg: true },
      },
    },
    take: 6, // keep token cost + latency bounded
    orderBy: { operator: { ratingAvg: "desc" } },
  });
  return rows;
}

export async function POST(req: Request) {
  const { userMessage, history } = await req.json();

  // First pass: let Claude decide filters & call the tool
  let resp = await anthropic.messages.create({
    model: "claude-sonnet-4-6", // planner = Sonnet (fast + cheap enough for interactive)
    max_tokens: 1024,
    tools: [searchListingsTool],
    system: PLANNER_SYSTEM, // see below
    messages: [...history, { role: "user", content: userMessage }],
  });

  // Handle tool calls (may be zero or one)
  const toolUse = resp.content.find((b) => b.type === "tool_use");
  let realRows: Listing[] = [];

  if (toolUse) {
    realRows = await runSearchListings(toolUse.input as SearchInput);
    resp = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools: [searchListingsTool],
      system: PLANNER_SYSTEM,
      messages: [
        ...history,
        { role: "user", content: userMessage },
        { role: "assistant", content: resp.content },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUse.id,
              // Give Claude ONLY id+facts it's allowed to reference
              content: JSON.stringify(
                realRows.map((r) => ({
                  id: r.id,
                  title: r.title,
                  price: r.basePrice,
                  difficulty: r.difficulty,
                  durationHours: r.durationHours,
                  place: r.place.name,
                  city: r.place.city,
                  category: r.category.name,
                })),
              ),
            },
          ],
        },
      ],
    });
  }

  const explanation = resp.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  // CRITICAL: return the REAL rows for the UI to render as bookable cards.
  // The UI uses realRows (linked by id), NOT anything parsed out of Claude's prose.
  return Response.json({ explanation, listings: realRows });
}
```

### System prompt (the second safety layer)

```
You are Bhraman's trip planner for Maharashtra adventure travel.
RULES:
- You may ONLY recommend listings returned by the searchListings tool. Never invent, recall, or
  describe listings that did not come from the tool. If the tool returns nothing, say so honestly
  and suggest loosening one constraint (budget, date, or difficulty).
- Reference each listing by its real title. Do not state a price unless it came from the tool.
- Briefly explain *why* each fits the user's stated constraints (budget / difficulty / location / date).
- Be concise. Rank by fit. Never promise availability the tool didn't confirm.
```

### Why this is safe

Two independent rails: the tool **can only return real rows** (DB is the only source), and the **UI renders those rows by id** (Claude's prose can't conjure a fake bookable card). Even if Claude hallucinated in text, there's no clickable fake listing. Belt and suspenders.

### Cost / latency (agent's choice, but defaults)

- Model: **Sonnet** for the planner - interactive, cheap enough, smart enough. Save Opus for nothing here.
- `take: 6` caps tokens. Don't dump 50 listings into context.
- **Stream** the explanation text to the UI (`anthropic.messages.stream`), then pop the cards after. Sequencing = the wow moment (see components-core, section D).
- **Rate-limit** this endpoint hard (e.g. 10/min/user via Upstash) - it's your only endpoint that costs real money per call. An open planner endpoint is a billing DoS.

---

## 2. Booking integrity - the double-booking problem

### The trap

Two users book the last seat on the same slot at the same instant. Naive code:

```typescript
// ❌ RACE CONDITION - never do this
const slot = await prisma.availabilitySlot.findUnique({ where: { id } });
if (slot.bookedSeats + groupSize <= slot.capacity) {     // both requests read "ok"
  await prisma.availabilitySlot.update({ ... });          // both write → oversold
}
```

Read-then-write with a gap. Both pass the check, both write, you oversold the trip. In a live demo with a judge + you clicking together, this fires.

### The decision

Make the seat claim **atomic and conditional in a single statement**, inside a transaction that also creates the booking. The database - not your code - enforces capacity.

### Pattern (GET THIS EXACT)

Use a conditional `updateMany` that only succeeds if seats are actually free, then check the count it affected.

```typescript
async function createBooking(input: { userId; listingId; slotId; groupSize }) {
  return await prisma.$transaction(async (tx) => {
    // 1. Atomically claim seats ONLY if enough remain. This is one statement -
    //    no gap for a race. `updateMany` returns how many rows it changed.
    const claimed = await tx.availabilitySlot.updateMany({
      where: {
        id: input.slotId,
        status: "OPEN",
        // the guard: capacity - booked >= requested
        capacity: { gte: /* see note */ undefined }, // expressed below via raw if needed
        bookedSeats: { lte: /* capacity - groupSize */ undefined },
      },
      data: { bookedSeats: { increment: input.groupSize } },
    });

    // Prisma can't compare two columns in `where` directly, so use a raw guard:
    // Prefer this exact raw update instead of the above when you need column math:
    //   UPDATE "AvailabilitySlot"
    //   SET "bookedSeats" = "bookedSeats" + $groupSize
    //   WHERE id = $slotId AND status = 'OPEN'
    //     AND "bookedSeats" + $groupSize <= capacity
    //   → returns affected row count

    if (claimed.count === 0) {
      // someone else took the seats, or slot closed - fail cleanly
      throw new BookingError("SLOT_UNAVAILABLE");
    }

    // 2. Snapshot price NOW (never recompute from live listing later)
    const slot = await tx.availabilitySlot.findUnique({
      where: { id: input.slotId },
      include: { listing: true },
    });
    const pricePerHead = slot.priceOverride ?? slot.listing.basePrice;

    // 3. Create the booking in PENDING (payment not done yet)
    const booking = await tx.booking.create({
      data: {
        bookingRef: genRef(), // e.g. "BHR-7K3F9"
        userId: input.userId,
        listingId: input.listingId,
        slotId: input.slotId,
        groupSize: input.groupSize,
        pricePerHead,
        totalAmount: pricePerHead * input.groupSize,
        listingTitleSnapshot: slot.listing.title,
        startTimeSnapshot: slot.startTime,
        status: "PENDING",
      },
    });

    // 4. Flip slot to FULL if now at capacity
    if (slot.bookedSeats >= slot.capacity) {
      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: { status: "FULL" },
      });
    }
    return booking;
  });
}
```

> **The single most important line:** the conditional update where `bookedSeats + groupSize <= capacity` is checked **in the same statement** that increments. Use the raw SQL form for the column-vs-column comparison. This is what makes it race-proof. Prisma's typed `updateMany` can't do `col + n <= col2`, so the raw `$executeRaw` guard is the correct tool here - don't let the agent "simplify" it back into read-then-write.

### The seat-release problem (don't forget this)

A PENDING booking holds seats. If the user abandons payment, those seats are stuck forever and your slot shows full falsely. **Decision:** PENDING bookings expire. Either:

- A short TTL (e.g. 15 min): a scheduled job (Vercel Cron) releases seats from PENDING bookings older than 15 min by decrementing `bookedSeats` and deleting/expiring the booking. **(recommended, simple)**
- Or claim seats only _after_ payment success in the webhook. (Cleaner but risks overselling between checkout-open and pay.)

Go with **TTL + cron release** for the hackathon - it's the standard pattern and demoable.

---

## 3. Payments + webhooks - Razorpay

### The trap

The browser says "payment succeeded!" and you mark the booking CONFIRMED. **Never do this.** The client can be faked, the network can drop after charge, and a closed tab loses the confirmation. Client-side success is not proof of payment.

### The decision

**The webhook is the source of truth.** Razorpay calls your server directly when payment actually settles. You confirm bookings there, and there only. The client success handler is just UX (show a spinner / redirect) - it never writes CONFIRMED.

### Flow (GET THIS EXACT)

```
1. Client clicks Reserve → POST /api/bookings  → creates PENDING booking (section 2)
2. Server creates Razorpay ORDER (amount from SERVER-computed total, not client)
                                  → returns razorpayOrderId to client
3. Client opens Razorpay checkout widget with that order id
4. User pays → Razorpay → fires webhook → POST /api/webhooks/razorpay
5. Webhook verifies signature → marks Payment CAPTURED + Booking CONFIRMED → sends email
6. Client's success callback just redirects to /booking/[ref] which reads the (now confirmed) state
```

### Order creation (amount comes from the server)

```typescript
// ❌ never: const order = createOrder({ amount: req.body.amount })  // client-controlled = fraud
// ✅ recompute from the booking row you created
const booking = await prisma.booking.findUnique({ where: { id } });
const order = await razorpay.orders.create({
  amount: booking.totalAmount * 100, // paise
  currency: "INR",
  receipt: booking.bookingRef,
  notes: { bookingId: booking.id }, // ← you read this back in the webhook
});
await prisma.payment.create({
  data: {
    bookingId: booking.id,
    amount: booking.totalAmount,
    razorpayOrderId: order.id,
    status: "CREATED",
  },
});
```

### Webhook handler (GET THIS EXACT - signature + idempotency)

Two things agents skip and both are critical: **verify the signature** (anyone can POST to your webhook URL) and **be idempotent** (Razorpay retries; webhooks fire more than once).

```typescript
// app/api/webhooks/razorpay/route.ts
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text(); // RAW body - needed for signature
  const signature = req.headers.get("x-razorpay-signature")!;

  // 1. VERIFY SIGNATURE - reject forgeries
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  if (expected !== signature) {
    return new Response("invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;

    // 2. IDEMPOTENCY - if already processed, ack and stop. Webhooks fire 2+ times.
    const existing = await prisma.payment.findUnique({
      where: { razorpayOrderId: orderId },
    });
    if (!existing || existing.status === "CAPTURED") {
      return new Response("ok", { status: 200 }); // already done - don't double-confirm/double-email
    }

    // 3. Confirm atomically
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { razorpayOrderId: orderId },
        data: { status: "CAPTURED", razorpayPaymentId: payment.id },
      });
      await tx.booking.update({
        where: { id: existing.bookingId },
        data: { status: "CONFIRMED" },
      });
    });

    // 4. Side effects AFTER commit (email). If this throws, payment is still safe.
    await sendBookingConfirmation(existing.bookingId);
  }

  // Always 200 quickly so Razorpay stops retrying. Do heavy work async if needed.
  return new Response("ok", { status: 200 });
}
```

> **Three non-negotiables here:** (1) verify signature on the **raw** body - if you parse JSON first the signature won't match; (2) idempotency check before mutating - or you'll send two confirmation emails and corrupt counts; (3) return 200 fast - Razorpay retries on timeout, multiplying the duplicate problem.

### Test mode

Use Razorpay **test keys** for the hackathon. Test card `4111 1111 1111 1111`, any future expiry, any CVV. Test UPI `success@razorpay`. You do NOT need a registered business or live KYC for the demo.

---

## 4. Refund + cancellation logic

### The trap

Hardcoding "50% refund." Adventure tourism cancellations are conditional: weather (operator cancels → 100% refund), within window (full), late (partial), no-show (none). If it's hardcoded, every listing is wrong and you can't demo the realistic case.

### The decision

`cancellationPolicy` is **structured JSON on the Listing**, read at cancellation time. Refund % is computed, not typed.

```typescript
// cancellationPolicy shape (store as JSON on Listing)
type CancellationPolicy = {
  weatherRefundPct: number; // 100 - operator-initiated weather cancel
  cutoffHours: number; // 48 - before start
  beforeCutoffPct: number; // 100
  afterCutoffPct: number; // 50
  noShowPct: number; // 0
};

function computeRefund(
  booking,
  policy: CancellationPolicy,
  reason: "USER" | "WEATHER",
) {
  if (reason === "WEATHER")
    return (booking.totalAmount * policy.weatherRefundPct) / 100;
  const hoursToStart =
    (booking.startTimeSnapshot.getTime() - Date.now()) / 3.6e6;
  const pct =
    hoursToStart >= policy.cutoffHours
      ? policy.beforeCutoffPct
      : policy.afterCutoffPct;
  return Math.round((booking.totalAmount * pct) / 100);
}
```

Then: issue the Razorpay refund for that amount, set `Payment.status = REFUNDED/PARTIALLY_REFUNDED`, `Payment.refundedAmount`, `Booking.status = CANCELLED/REFUNDED`, **and release the seats** (decrement `bookedSeats`, set slot back to OPEN if it was FULL). Forgetting the seat release is the common bug - a cancelled booking that still blocks the seat.

---

## 5. Availability generation

### The trap

Hand-creating slot rows, or worse, one slot per listing. You need "every Sat & Sun for the next 3 months" without 50 manual inserts, and the planner/booking both depend on real future slots existing.

### The decision

A generator function operators trigger ("repeat weekly until date"). Agent's choice on UI, but the logic:

```typescript
function generateSlots(
  listingId,
  { weekdays, startTime, capacity, fromDate, toDate, priceOverride },
) {
  const slots = [];
  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    if (weekdays.includes(d.getDay())) {
      // 0=Sun..6=Sat
      const start = setTimeOfDay(new Date(d), startTime);
      slots.push({
        listingId,
        startTime: start,
        endTime: addHours(start, listing.durationHours),
        capacity,
        bookedSeats: 0,
        priceOverride,
        status: "OPEN",
      });
    }
  }
  return prisma.availabilitySlot.createMany({ data: slots });
}
```

**Seed real future slots** when seeding the 60-70 listings, or the demo shows "no dates available" and the booking flow can't run. This bites people the morning of the demo.

---

## 6. Authorization - who can do what

### The trap

Clerk handles _authentication_ (is this a valid user). It does NOT handle _authorization_ (can THIS user edit THIS listing). Agents wire up login and forget the ownership check, so any logged-in operator can edit anyone's listings by changing an id in the URL. A judge poking at this finds it instantly.

### The decision

**Every operator mutation re-checks ownership server-side.** Never trust that the UI hid the button.

```typescript
async function assertOwnsListing(userId: string, listingId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { operator: { select: { userId: true } } },
  });
  if (!listing || listing.operator.userId !== userId) {
    throw new ForbiddenError(); // 403 - not their listing
  }
}
// call at the TOP of every update/delete/availability action on a listing
```

Same for bookings (a traveler can only see/cancel their own), payouts (operator sees only theirs), and the admin role gate. Do it in the server action/route, not the component.

---

## 7. Search / filter query logic

### The trap

Translating 6 filter controls into 6 separate queries, or fetching everything and filtering in JS (slow, breaks at scale). And the N+1: rendering 60 cards each firing a query for its operator/place.

### The decision

One Prisma query, conditional `where`, and **`include` the relations you render** so it's a single round-trip. Index the columns you filter on.

```typescript
const listings = await prisma.listing.findMany({
  where: {
    status: "PUBLISHED",
    ...(filters.categories?.length && {
      category: { slug: { in: filters.categories } },
    }),
    ...(filters.difficulty?.length && {
      difficulty: { in: filters.difficulty },
    }),
    ...(filters.minPrice || filters.maxPrice
      ? {
          basePrice: {
            gte: filters.minPrice ?? undefined,
            lte: filters.maxPrice ?? undefined,
          },
        }
      : {}),
    ...(filters.city && { place: { city: filters.city } }),
    ...(filters.date && {
      slots: { some: { startTime: { gte: filters.date }, status: "OPEN" } },
    }),
  },
  include: {
    place: true,
    category: true, // ← prevents N+1
    operator: {
      select: { businessName: true, isVerified: true, ratingAvg: true },
    },
  },
  orderBy:
    filters.sort === "price"
      ? { basePrice: "asc" }
      : { operator: { ratingAvg: "desc" } },
  take: 24,
  skip: (page - 1) * 24, // pagination, not fetch-all
});
```

Matching indexes (already in your schema): `@@index([categoryId, difficulty])`, `@@index([basePrice])`, `@@index([status])`, `@@index([listingId, startTime])` on slots. These make the filters fast. Add a `city` index on Place (it's there).

---

## 8. Performance - fast loads

### Decisions, ranked by impact

1. **Server Components by default.** Listing pages, detail pages, discovery - all fetch on the server and render as RSC. Only the _interactive_ bits are client components: the booking panel, filters, the planner chat, the image gallery. Rule: `"use client"` only when you need `useState`/`onClick`/browser APIs. Pushing the client boundary as deep as possible = less JS shipped = faster.

2. **Caching, matched to freshness:**
   - **Static-ish (place pages, listing detail content):** cache aggressively. `export const revalidate = 3600` (ISR) - regenerate hourly. Listings don't change minute-to-minute.
   - **Availability + prices:** do NOT cache, or cache seconds only. Stale "available" → double-booking confusion. Fetch slot availability fresh (`cache: "no-store"` / dynamic).
   - **The trap:** caching the whole detail page including the live booking panel. Split it: static content cached, availability fetched dynamically inside it.

3. **Images** (your site is image-heavy - this is the biggest real perf lever):
   - `next/image` always - automatic resize, WebP/AVIF, lazy-load below fold.
   - Hero image: `priority` so it doesn't lazy-load.
   - Store images on a CDN (Cloudinary / Vercel Blob / Supabase Storage), serve responsive `sizes`. Never ship 4MB originals.
   - Blur placeholder (`placeholder="blur"`) so cards don't pop in jarringly.

4. **Don't over-fetch.** `select` only the fields a view needs. The card query doesn't need the full `description` Text column - that's detail-page only. Big text columns in a list query = slow.

5. **Streaming + Suspense.** Wrap slow sections (reviews, related listings) in `<Suspense>` so the page shell + hero paint immediately while they stream in. Perceived speed > total speed.

6. **Database location.** Put Postgres in the **same region** as your Vercel functions (e.g. both Mumbai `bom1`/ap-south). Cross-region DB round-trips are the silent latency killer - every query pays the Atlantic tax otherwise.

---

## 9. Quick "let the agent handle it" list (don't over-engineer)

These are fine with standard agent output, no special care:

- Clerk auth wiring, sign-in/up pages
- Basic CRUD forms (create/edit listing fields)
- Layout, responsive breakpoints, the component styling (use the HTML libraries)
- Email templates (Resend) - just trigger them from the right place (post-commit, section 3)
- Static pages (about, how-it-works)
- Toast/modal mechanics (Framer Motion patterns are in components docs)

---

## 10. Priority order for build (logic-wise)

If time gets tight, this is the order that protects the demo:

1. **Booking integrity + payment webhook** (sections 2-3) - if this breaks, there's no product.
2. **AI planner safety** (section 1) - your differentiator; a hallucinated listing on stage is fatal.
3. **Availability seeding** (section 5) - without future slots nothing is bookable.
4. **Authorization** (section 6) - cheap to add, embarrassing to miss.
5. **Refund logic** (section 4) - the realistic-marketplace point.
6. **Performance passes** (section 8) - last, once flows work. Don't optimize a broken flow.

> Golden rule for the whole build: **get one complete path bulletproof** (discover → plan → book → pay → confirm → operator sees it) before adding breadth. A judge remembers one flawless flow over ten janky features.
