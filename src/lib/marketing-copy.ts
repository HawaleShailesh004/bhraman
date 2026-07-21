/** Locked marketing voice: confident, specific, calm - minimal outside hero. */

export const COPY = {
  brandEyebrow: "Maharashtra adventure, verified",

  hero: {
    badge: "Verified operators · payment held until you're back",
    headlineLine1: "The Sahyadris,",
    minusWord: "minus",
    headlineRest: "the guesswork.",
    headlineLine2: "minus the guesswork.",
    /** @deprecated use headlineLine1 / minusWord / headlineRest */
    headline: "The Sahyadris, minus the guesswork.",
    subline:
      "Verified operators, honest weather, payment held until you're back. Tell us the vibe — get three real trips.",
    ctaPrimary: "Find this weekend's trips",
    ctaSecondary: "How it works",
  },

  escrow: {
    primary:
      "Your money's held safe until the trip actually happens. Trek called off? You're not chasing anyone - the payment was never released.",
    short: "Held until the trip happens.",
    nearReserve: "Held until you're back",
    reassurance: "No stranger UPI. We hold it.",
  },

  safety: {
    header: "Know the room before you book.",
    sub: "See how many women are on each batch, which operators have women leading treks, and reviews from travelers who actually went.",
    softHeader: "Built to be checked.",
  },

  why: {
    eyebrow: "Why Bhraman",
    title: "Verified. Honest weather. Money held.",
    items: [
      {
        title: "Verified operators",
        text: "Insurance, guides, track record - checked.",
      },
      {
        title: "Honest weather",
        text: "We'll tell you when a trek's a genuine go - even when it costs us the booking.",
      },
      {
        title: "Money held",
        text: "Operator paid after the trip. Cancelled? Full refund.",
      },
    ],
  },

  ai: {
    eyebrow: "AI planner",
    title: "Tell us the vibe.",
    sub: "First trek, girls' trip, something hard. Get three real, bookable plans back.",
    cta: "Try the AI planner",
    dockGreeting: "Hey, how may I help you?",
    dockHint: "Pick a vibe - or open the planner.",
    loading: "Reading the vibe…",
    starters: [
      {
        label: "First trek, scared of heights",
        href: "/plan?q=first%20trek%20easy%20scared%20of%20heights",
      },
      {
        label: "Girls' trip, woman-led",
        href: "/plan?q=girls%20trip%20woman%20led%20operator",
      },
      {
        label: "Challenging trek under ₹3000",
        href: "/plan?q=challenging%20trek%20under%203000",
      },
    ],
  },

  how: {
    eyebrow: "How it works",
    title: "Three moves.",
    steps: [
      { title: "Discover", text: "Real operators. Open seats." },
      { title: "Plan", text: "AI shortlist. Actually bookable." },
      { title: "Book safe", text: "We hold the money until you're back." },
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "Straight answers.",
    items: [
      {
        q: "Can I cancel?",
        a: "Cancel free before 24 hours of departure. After that, partial refund per listing policy. Weather cancels = full refund.",
      },
      {
        q: "Weather cancels my trek?",
        a: "Full refund. Automatically.",
      },
      {
        q: "Where does my money go?",
        a: "We hold it. Operator gets paid after the trip.",
      },
      {
        q: "Is the operator real?",
        a: "Verified badge = checks passed.",
      },
      {
        q: "Safe for solo women?",
        a: "See batch gender mix and women-led operators before you book.",
      },
    ],
  },

  map: {
    eyebrow: "On the map",
    title: "Maharashtra, pin by pin.",
    sub: "Tap a place. See what's bookable.",
  },

  proof: {
    eyebrow: "Proof",
    title: "Check before you pay.",
  },

  trending: {
    eyebrow: "Worth booking",
    title: "Open seats this weekend.",
  },

  explore: {
    eyebrow: "Categories",
    title: "Choose your adventure",
    sub: "",
    seeAll: "View all activities",
    empty: "Nothing open here yet.",
  },

  micro: {
    emptySaved: "Nothing saved yet.",
    soldOut: "Full. More dates this month.",
    batchConfirming: "more and this batch runs.",
    operatorReply: "Usually under an hour.",
  },
} as const;
