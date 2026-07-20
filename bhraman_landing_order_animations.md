# Bhraman - Landing Page Order & Scroll Animation System

## Part 1 - Recommended section order

The arc: **Hook → Understand → Trust → Explore → Convert.** Each section earns the next.

| #   | Section               | Role in the arc        | Why here                                                                |
| --- | --------------------- | ---------------------- | ----------------------------------------------------------------------- |
| 1   | Navbar (fixed)        | -                      | Always present                                                          |
| 2   | Hero                  | Hook                   | The 2-second "what is this"                                             |
| 3   | CategoryDock          | Understand             | First question: "what can I do here?"                                   |
| 4   | TrendingCarousel      | Understand             | Real live trips - proves it's real before claims                        |
| 5   | WhyWeBuiltQuote       | Trust (emotional)      | Now they know _what_, tell them _why_                                   |
| 6   | WhyBhramanSection     | Trust (rational)       | The three moats: verified / weather / escrow                            |
| 7   | HowItWorksSticky      | Understand deeply      | Bought into why → show how. Page centerpiece                            |
| 8   | CompareSlider         | Trust (contrast)       | Dramatizes WhatsApp-vs-Bhraman right after "how"                        |
| 9   | MaharashtraMapSection | Explore                | They understand + trust → let them explore by place                     |
| 10  | ProofStrip            | Trust (reinforce)      | Live ratings/batch mix as they near a decision                          |
| 11  | OperatorSpotlight     | Trust (human)          | Real teams run these trips                                              |
| 12  | WhatWeBelieveQuote    | Emotional peak         | Manifesto right before conversion                                       |
| 13  | TrustFaqSection       | Objection-kill         | FAQs belong late - for the already-interested                           |
| 14  | PlannerOrb            | Convert                | Final "just tell us the vibe"                                           |
| 15  | LiveTicker            | Closing pulse          | "This is happening now, join in" - works as closer, was noise as opener |
| 16  | Footer                | -                      | Close                                                                   |
| -   | AiConciergeDock       | Floating (not in flow) | Persistent bottom-right across whole page                               |

**Key moves from your original order:**

- **LiveTicker #3 → #15.** A ticker of bookings is meaningless before the visitor knows what the site does. Proof must follow claim, not precede it. As a closing pulse it earns its place.
- **CategoryDock #4 → #3.** First real question after the hook is "what can I do," so answer immediately.
- **TrustFaqSection stays late (#13).** FAQs are for people already interested - placing them early signals doubt.
- **Quotes spaced as breathing pauses** (#5 and #12), never back-to-back.
- **AiConciergeDock removed from linear flow** - it's a fixed floating element. Also: check it isn't redundant with PlannerOrb. Make the orb the in-page moment, the dock the persistent floater.

---

## Part 2 - The scroll-reveal system (the "appear on scroll" effect)

The effect you're describing - element invisible, then animates in when it enters the viewport - is a **scroll-reveal / scroll-triggered entrance**. The trick to making it feel _premium_ rather than random: use ONE consistent easing and a small vocabulary of entrance types, applied with intention per section.

### Core rules

- **One easing everywhere:** `cubic-bezier(0.22, 1, 0.36, 1)` (a smooth ease-out). Consistency = craft.
- **Duration:** 500–700ms. Faster feels cheap, slower feels sluggish.
- **Distance:** subtle - 20–40px of movement, never a big dramatic slide.
- **Trigger once:** reveal when entering; don't re-hide on scroll up (except for looping things like the ticker). Re-triggering feels gimmicky.
- **Trigger point:** when the element is ~15% into the viewport, not the moment it touches the edge.
- **Stagger groups:** items in a group (cards, list rows) reveal in sequence, ~60–80ms apart - never all at once.
- **ALWAYS respect `prefers-reduced-motion`:** show everything instantly for those users.

### The vocabulary (5 entrance types - don't invent more)

1. **Fade-up** - opacity 0→1 + translateY(28px→0). The default. Use for most sections, headings, paragraphs.
2. **Fade-in** - opacity only. For large images/backgrounds where movement would feel heavy.
3. **Stagger-up** - fade-up applied to children in sequence. For card grids, category tiles, list rows.
4. **Word-reveal** - words rise from behind a mask, staggered. Reserve for the big quote moments and one hero-adjacent headline. High-impact, so use rarely.
5. **Scale-settle** - image starts scale(1.05)→1.0 + fade. For hero-ish feature images entering view. Subtle life.

---

## Part 3 - Animation map, section by section

Exactly which entrance each section gets, so it's intentional:

| Section               | Entrance animation                                   | Notes                                         |
| --------------------- | ---------------------------------------------------- | --------------------------------------------- |
| Navbar                | none (fixed)                                         | Shifts translucent→solid after 80px scroll    |
| Hero                  | already visible; internal parallax on scroll-out     | Headline can use word-reveal on load          |
| CategoryDock          | **stagger-up** on tiles                              | Tiles rise in sequence, 70ms apart            |
| TrendingCarousel      | **fade-up** on the row + **stagger-up** on cards     | Cards also use tilt-on-hover (spatial)        |
| WhyWeBuiltQuote       | **word-reveal**                                      | The signature quote entrance                  |
| WhyBhramanSection     | **stagger-up** on the 3 moat items                   | Each moat rises after the last                |
| HowItWorksSticky      | sticky-pinned scrub (not an entrance)                | Steps fade between as you scroll; image swaps |
| CompareSlider         | **fade-up** on the whole module                      | The drag interaction is the "animation"       |
| MaharashtraMapSection | **fade-in** on map + hotspots **stagger-in** (pulse) | Pins rise/settle on enter                     |
| ProofStrip            | **fade-up** + **count-up** on numbers                | Stats tick from 0 when they enter             |
| OperatorSpotlight     | **fade-up** + marquee auto-scroll                    | Or stagger-up if it's a static grid           |
| WhatWeBelieveQuote    | **stagger-up** on manifesto lines                    | Lines rise in sequence, 180ms apart           |
| TrustFaqSection       | **fade-up** on each accordion row                    | Subtle; this is a calm utility section        |
| PlannerOrb            | **scale-settle** on the orb + breathing loop         | Orb pulses gently, continuously               |
| LiveTicker            | continuous marquee                                   | No entrance; it just scrolls                  |
| Footer                | **fade-up**                                          | Gentle close                                  |

---

## Part 4 - Implementation

### Simplest: CSS + IntersectionObserver (covers 90% - fade-up, fade-in, stagger, scale)

```css
/* base hidden states */
[data-reveal] {
  opacity: 0;
  transition:
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
[data-reveal="up"] {
  transform: translateY(28px);
}
[data-reveal="scale"] {
  transform: scale(1.05);
}
[data-reveal].in {
  opacity: 1;
  transform: none;
}

/* stagger children */
[data-stagger] > * {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
[data-stagger].in > * {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal],
  [data-stagger] > * {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

```js
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add("in");
      // stagger children
      if (el.hasAttribute("data-stagger")) {
        [...el.children].forEach((child, i) => {
          child.style.transitionDelay = i * 0.07 + "s";
        });
      }
      io.unobserve(el); // trigger once
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
);

document
  .querySelectorAll("[data-reveal],[data-stagger]")
  .forEach((el) => io.observe(el));
```

Usage:

```html
<section data-reveal="up">...</section>
<div data-stagger class="cards">...cards...</div>
<img data-reveal="scale" ... />
```

### For the harder ones (word-reveal, sticky scrollytelling, count-up)

- **In React:** use **Framer Motion** - `whileInView` prop handles reveal-on-scroll natively, `staggerChildren` for groups. Cleanest fit for your Next.js stack.
- **Sticky scrollytelling (HowItWorks) + word-reveal:** **GSAP ScrollTrigger** (now 100% free) - it's the industry standard for pinning + scrubbing. Use it only for the 2–3 sections that need it; don't pull GSAP in for simple fades.
- **Smooth scroll under everything:** **Lenis** - makes every reveal feel buttery. ~10 lines.

### Library split (don't over-tool)

- **Framer Motion** → all the standard reveals, staggers, hover states (you already have it).
- **GSAP ScrollTrigger** → HowItWorksSticky pin + WhyWeBuiltQuote/WhatWeBelieve word-reveals only.
- **Lenis** → global smooth scroll.
- **Plain CSS/IO** → fine if you'd rather not add Framer for the simple ones.

---

## Part 5 - The one discipline that keeps it premium

**Not everything should animate.** If every section fades up identically, the effect becomes wallpaper and stops being noticed. The rhythm that reads as _authored_:

- Most sections: quiet **fade-up**.
- A few signature moments: **word-reveal** (quotes), **sticky scrub** (how it works), **count-up** (proof), **drag** (compare).
- The contrast between quiet and signature is what creates premium pacing. A page where everything is dramatic feels as flat as a page where nothing moves.

Reveal-on-scroll is seasoning. The content is the meal.
