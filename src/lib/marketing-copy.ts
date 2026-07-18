/** Locked marketing voice: confident, specific, calm - minimal outside hero. */

export const COPY = {
  brandEyebrow: "Maharashtra adventures",

  hero: {
    badge: "Verified operators · payment held until you're back",
    headlineLine1: "The Sahyadris,",
    headlineLine2: "minus the guesswork.",
    /** @deprecated use headlineLine1/2 */
    headline: "The Sahyadris, minus the guesswork.",
    subline:
      "Tell us the vibe. Get real trips back - verified operators, honest weather, and your money held safe until you're home.",
    ctaPrimary: "Plan my weekend",
    ctaSecondary: "Browse adventures",
  },

  escrow: {
    primary:
      "You pay us. We hold it until the trip runs. Then the operator gets paid.",
    short: "Pay now. Released after your trip.",
    nearReserve: "Held until you're back",
    reassurance: "No stranger UPI. We hold it.",
  },

  safety: {
    header: "Know the room before you book.",
    sub: "Gender mix, women-led operators, real reviews - on the page.",
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
        text: "We say go or no-go. Even if it costs a booking.",
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
    sub: "Get bookable trips - not a PDF.",
    cta: "Try the AI planner",
    dockGreeting: "Hey, how may I help you?",
    dockHint: "Pick a vibe - or open the planner.",
    loading: "Reading the vibe…",
    starters: [
      {
        label: "First trek this weekend",
        href: "/plan?q=first%20trek%20easy%20this%20weekend",
      },
      {
        label: "Girls' trip, woman-led",
        href: "/plan?q=girls%20trip%20woman%20led%20operator",
      },
      {
        label: "Something hard in the Sahyadris",
        href: "/plan?q=challenging%20sahyadri%20trek",
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
