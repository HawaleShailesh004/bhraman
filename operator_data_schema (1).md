# Conceptual Data Schema - Tour Operator Platform

### For: Cofounder's operator meeting - what data to collect, and why

This is built as **one core model that works for every activity type** - trekking, paragliding, scuba/water sports, jungle safaris, cycling, general sightseeing - rather than a separate schema per sport. Every operator fills the same core fields; activity-specific details go into a flexible "attributes" layer that adapts per category. This is exactly how Zomato handles "restaurant" vs "cloud kitchen" vs "bar," and how Airbnb handles "apartment" vs "treehouse" vs "houseboat" - one skeleton, swappable specifics.

**Five entities. Everything else is a sub-table hanging off these.**

1. Operator (the business/person)
2. Listing (a tour/trek/activity product they offer)
3. Batch (a specific scheduled instance of a listing, with its own seats/dates)
4. Booking (a customer's purchase of a seat in a batch)
5. Review (post-booking feedback)

---

## 1. OPERATOR - the business itself

This is what becomes their **portfolio page** and is also the trust/verification backbone. Every field here maps to a specific problem from the root-cause research - I've noted which.

### 1.1 Identity & legitimacy

| Field                                                   | Why you need it                                                                                                                                                                    |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Legal business name                                     | Contracts, invoicing, GST if applicable                                                                                                                                            |
| Display/brand name                                      | What customers see (e.g. "Adventure Geek" vs legal entity name)                                                                                                                    |
| Owner/founder name(s)                                   | Trust - customers want to know who's actually running this                                                                                                                         |
| Business type                                           | Sole proprietor / Partnership / Pvt Ltd / Unregistered individual - be honest, most will be unregistered individuals, that's fine, just capture it                                 |
| PAN number                                              | Baseline identity verification, tax reporting later                                                                                                                                |
| GST number (if applicable)                              | Only if turnover crosses threshold - don't force this, most won't have it                                                                                                          |
| MTDC / Ministry of Tourism registration number (if any) | Rare, but if they have it, it's a huge trust badge - flag prominently                                                                                                              |
| Years in operation                                      | Trust signal, also lets you segment "established" vs "new" operators                                                                                                               |
| Business address / base location                        | Where they're based (Pune, Mumbai, Nashik etc.) - critical for "near me" search                                                                                                    |
| Contact phone (WhatsApp-linked)                         | Their existing comms channel - you're not replacing this, you're layering on top                                                                                                   |
| Contact email                                           | Secondary channel                                                                                                                                                                  |
| Bank account / UPI ID for payouts                       | **Escrow requirement** - this is how you pay them after successful trip completion. This is the single most important field for the seat-loss/payment-loss problem from the report |

### 1.2 Activity categories they operate in

| Field                               | Why                                                                                                                                                                                                             |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary category                    | Trekking / Adventure sports / Water sports / Wildlife safari / Cultural & heritage / Pilgrimage / Cycling / Camping - pick the taxonomy, this drives which "attributes" template a listing gets (see Section 2) |
| Secondary categories (multi-select) | Most operators do 2-3 things - e.g. trekking + camping. Don't force single-category                                                                                                                             |
| Regions they operate in             | Sahyadris / Konkan coast / Himalayas / specific district - powers location search                                                                                                                               |

### 1.3 Trust & safety infrastructure - **this directly solves the trust-deficit and female-safety root causes from the research**

| Field                                                                                                          | Why                                                                                                                                                      |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Total trips/batches conducted (all-time)                                                                       | Social proof number, shown on profile                                                                                                                    |
| Insurance coverage - yes/no, provider, coverage details                                                        | This is the #1 latent-scandal-prevention field. Even a basic personal accident cover for participants is a massive differentiator once you can verify it |
| Number of certified/trained trek leaders on team                                                               | Trust signal                                                                                                                                             |
| Do you have female trek leaders/guides? (count)                                                                | Directly answers the #1 female-safety question from research                                                                                             |
| POSH policy in place? (yes/no)                                                                                 | Most won't have this yet - you may need to help them create one. Flag as "in progress" rather than disqualifying                                         |
| Emergency response protocol (free text or checklist: first aid kit, nearest hospital contact, evacuation plan) | Safety infrastructure customers can't currently see anywhere                                                                                             |
| Any past safety incidents disclosed (optional, sensitive)                                                      | Handle carefully - this is for internal risk assessment, not necessarily public display initially                                                        |

### 1.4 Portfolio / brand content

| Field                                                                                   | Why                                                                                           |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Profile photo/logo                                                                      | Basic branding                                                                                |
| Cover photo / banner images (multiple)                                                  | Portfolio visual - this is literally solving "no personal portfolio"                          |
| About/story (free text, 200-500 words)                                                  | Founder story, philosophy - the human trust layer that Instagram captions do informally today |
| Instagram / social media links                                                          | Cross-link their existing following, don't make them abandon it                               |
| Sample gallery (photos from past trips, 10-20 images)                                   | Portfolio proof                                                                               |
| Languages spoken by guides                                                              | Marathi/Hindi/English/others - solves the language-friction problem from research             |
| Certifications (Mountaineering, First Aid, Lifeguard, Wilderness First Responder, etc.) | Depends on category - critical for water sports/paragliding especially                        |

### 1.5 Financial/operational (for your ops, not customer-facing)

| Field                           | Why                                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| Commission tier agreed          | Your revenue model                                                                  |
| Payout cycle preference         | Weekly/per-batch/monthly - operator cash flow need, ties to the seasonality problem |
| Average batch size (historical) | Helps you understand their scale for onboarding tier                                |

---

## 2. LISTING - a specific tour/trek/activity product

This is the reusable "template" - e.g. "Kalsubai Night Trek" is one listing that might run 20 times a year as different batches.

### 2.1 Universal fields (every category needs these)

| Field                                                                                                      | Why                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Listing title                                                                                              | e.g. "Kalsubai Peak Night Trek"                                                                                                                                                                                      |
| Category (inherits from operator, but a listing can be one specific category)                              | Drives which attribute template shows below                                                                                                                                                                          |
| Short description (1-2 lines)                                                                              | For listing cards/search results                                                                                                                                                                                     |
| Full description (long-form)                                                                               | **Solves the "no proper information" root cause.** This is where the AI-assisted listing generation from the report comes in - you can have the operator record a voice note and auto-generate this                  |
| Difficulty level                                                                                           | Easy / Moderate / Difficult / Extreme - standardized scale across ALL categories so customers can compare a trek's difficulty to a scuba dive's difficulty on the same visual scale                                  |
| Duration                                                                                                   | Hours for day activities, Days/Nights for multi-day                                                                                                                                                                  |
| Price per person                                                                                           | Base price                                                                                                                                                                                                           |
| What's included (checklist: transport, food, guide, equipment, permits, insurance)                         | Solves price-opacity problem                                                                                                                                                                                         |
| What's excluded                                                                                            | Same                                                                                                                                                                                                                 |
| Meeting point / pickup locations (multiple)                                                                | Logistics clarity                                                                                                                                                                                                    |
| Minimum age                                                                                                | Safety/eligibility                                                                                                                                                                                                   |
| Maximum group size                                                                                         | Caps batch size                                                                                                                                                                                                      |
| Fitness/medical prerequisites (free text + checklist: cardiac conditions, recent surgery, pregnancy, etc.) | Safety - reduces mid-trip incidents                                                                                                                                                                                  |
| Things to carry (checklist, customizable)                                                                  | Solves the "extra details" phone-call problem                                                                                                                                                                        |
| Cancellation/refund policy                                                                                 | **This should NOT be freely editable per operator** - you want a platform-standard policy (from the escrow research) with maybe 2-3 tiers operators pick from, not each operator inventing their own draconian terms |
| Photos/videos specific to this listing                                                                     | Visual proof                                                                                                                                                                                                         |

### 2.2 Category-specific attributes (this is the flexible layer)

Don't build 10 different listing tables. Build **one flexible "attributes" set per category** that only shows relevant fields. Here's what each category actually needs - give this to your dev as the category templates:

**Trekking / Hiking**

- Peak/fort name, elevation (meters), trek distance (km one-way), elevation gain, terrain type (rocky/forest/grassland), water source availability on trail, night trek yes/no, best season, permit required (yes/no - Forest Dept permits are common in Maharashtra), historical/monument significance

**Adventure sports - Paragliding, Bungee, Zip-lining**

- Equipment certification/brand, max weight limit, min/max age, tandem vs solo, altitude/height of jump, duration of activity, weather-dependency window, instructor-to-participant ratio, safety certification body (e.g., APPI for paragliding)

**Water sports - Scuba, Snorkeling, Rafting, Jet-ski, Kayaking**

- Water body type (sea/river/lake), swimming requirement (yes/no/basic), certification provided (PADI/none), depth (for scuba), life jacket provided (yes/no - should always be yes, but verify), grade of rapids (for rafting), season/tide dependency, equipment sanitization process

**Wildlife Safari**

- Reserve/park name, permit type required, vehicle type (gypsy/canter/boat), best time of day, wildlife typically spotted, forest department booking lead time, guide's naturalist certification

**Camping**

- Tent type & capacity, bonfire included (yes/no), toilet facilities (yes/no/type), electricity availability, food arrangement (cooked/packaged), distance from nearest town/hospital

**Cycling tours**

- Route distance, terrain (road/off-road/mixed), bike provided or BYO, gear/support vehicle availability, e-bike option

**Pilgrimage/religious tours**

- Sites covered, darshan/queue arrangements, dress code requirements, accommodation type near sites

**General sightseeing/day trips**

- Sites covered (list), entry tickets included (yes/no), guide commentary language, shopping stops included

_(Build this as a JSON-flexible attributes field per listing, keyed by category, rather than rigid columns - this is the technical implementation your dev will recognize as "EAV pattern" or a JSONB column in Postgres. Conceptually: every listing has a fixed core + a flexible bag of category-specific key-value pairs.)_

---

## 3. BATCH - a specific scheduled instance of a listing

This is what actually gets booked. "Kalsubai Night Trek" (listing) happening "12th July, pickup 10pm from Pune" (batch).

| Field                                                                | Why                                                                                                                                                                                                       |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Linked listing                                                       | Which product this batch belongs to                                                                                                                                                                       |
| Date(s) - start and end                                              | Scheduling                                                                                                                                                                                                |
| Departure time & pickup point (can override listing default)         | Logistics                                                                                                                                                                                                 |
| Total seats available                                                | Capacity                                                                                                                                                                                                  |
| Seats booked (calculated)                                            | Real-time availability - **this is what kills the "no proper information / last-minute seat loss" problem.** Live seat count visible to customers stops the "DM for availability" back-and-forth entirely |
| Seats remaining (calculated)                                         | Same                                                                                                                                                                                                      |
| Current gender split of confirmed bookings (male/female/other count) | **Directly powers the female-safety trust feature** - showing "6 women already booked" to a prospective female customer is one of the single highest-leverage features from the research                  |
| Batch status                                                         | Open / Filling fast / Full / Confirmed (min seats hit) / Cancelled / Completed                                                                                                                            |
| Minimum seats to confirm departure                                   | Many operators need a minimum headcount to not run at a loss - this should trigger automatic notifications ("3 more bookings needed to confirm this batch")                                               |
| Assigned trek leader/guide (linked to operator's team roster)        | Accountability - customer can see who's actually leading                                                                                                                                                  |
| Weather contingency note (if applicable)                             | Transparency                                                                                                                                                                                              |

---

## 4. BOOKING - a customer's purchase

| Field                                                    | Why                                                                                                                                                                    |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Linked batch                                             | Which specific trip                                                                                                                                                    |
| Customer details (name, phone, email, gender, age, city) | **This directly solves the "no tracking of data - travelers, visitors, return, male/female" root cause.** This is the CRM data operators currently have zero access to |
| Number of seats booked                                   | Group bookings                                                                                                                                                         |
| Names of all participants (if booking for a group)       | Needed for permits/insurance/manifests                                                                                                                                 |
| Emergency contact (name + phone)                         | Safety requirement, currently often missing entirely on WhatsApp bookings                                                                                              |
| Medical/fitness disclosures                              | Safety, matches listing prerequisites                                                                                                                                  |
| Amount paid                                              | Transaction record                                                                                                                                                     |
| Payment status                                           | Pending / Escrowed / Released to operator / Refunded / Disputed - **this is the core mechanic of the escrow solution from the research**                               |
| Booking date/timestamp                                   | For repeat-customer tracking                                                                                                                                           |
| Is repeat customer? (calculated from customer history)   | **Powers the retention-marketing feature from the report** - "you have 340 women in your history, here's who to re-target"                                             |
| Cancellation requested? Date, reason                     | Feeds refund policy logic                                                                                                                                              |
| Special requests (free text)                             | Dietary, accessibility, etc.                                                                                                                                           |

---

## 5. REVIEW - post-trip feedback

| Field                                                                     | Why                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Linked booking (not just linked operator!)                                | **Critical distinction from your research** - reviews should only be postable by _verified completed bookings_, exactly like Zomato's verified-order reviews. This solves the "reviews are unreliable/gameable" problem identified in the research |
| Rating (overall)                                                          | Standard                                                                                                                                                                                                                                           |
| Sub-ratings: safety, guide quality, value for money, information accuracy | Granular trust signals - especially safety rating matters for the female-safety trust layer                                                                                                                                                        |
| Written review                                                            | Free text                                                                                                                                                                                                                                          |
| Photos from the trip                                                      | User-generated content, builds operator portfolio further                                                                                                                                                                                          |
| Operator's response (optional)                                            | Shows accountability, matches how the research flagged "how a company handles negative feedback" as a trust signal                                                                                                                                 |
| Verified badge (auto - only shows if linked to real booking)              | Non-negotiable trust mechanism                                                                                                                                                                                                                     |

---

## What to actually ask operators tomorrow - the practical extraction list

Your cofounder doesn't need to read them this whole schema. Walk through it as five simple questions, in this order, and let the schema fill itself in behind the scenes:

1. **"Tell me about your business"** → captures all of Section 1 (Operator) naturally in conversation - name, how long running, where based, who's on the team, any certifications/insurance they have
2. **"Walk me through your most popular trip"** → captures Section 2 (Listing) - this is where you'll also discover which category-specific attributes actually matter to them; let them talk, then map their answer onto the relevant category template
3. **"How do you currently schedule and manage seats?"** → captures Section 3 (Batch) - probably answered as "I make a WhatsApp poll" or "first come first serve on chat" - that's fine, you're about to replace that motion
4. **"What do you currently know about your customers?"** → this question itself demonstrates the gap (Section 4) - most will say "not much, it's all in my head/chat history" - that's your proof point for why the platform matters
5. **"Do you collect reviews today? How?"** → captures Section 5 - likely "word of mouth" or unverified Google reviews - another gap you're filling

---

## One thing to flag to your cofounder before the meeting

Don't ask operators to fill all of this in one sitting - it's too much and will scare off a WhatsApp-only operator who's never used a form in their life. The realistic onboarding sequence is:

1. **Minimum viable operator profile** (name, phone, location, category, 1 photo) - takes 5 minutes, gets them "live"
2. **First listing** with just the universal fields - gets their first product bookable
3. **Everything else (insurance, certifications, POSH, detailed attributes) fills in progressively** - either your team does it for them in a follow-up call, or you incentivize completion with a "verified" badge that only unlocks once trust fields are filled

This matches how Bucketlistt/Zomato/Urban Company actually onboard supply-side - low-friction first, trust-layer completion second. If you ask for the insurance certificate and POSH policy on day one, several of your 4-5 ready operators will bounce.
