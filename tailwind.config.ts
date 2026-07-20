import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FAF8F3",
        "paper-2": "#EDE6D8",
        sand: "#EDE6D8",
        ink: "#14231B",
        deep: "#0F1D15",
        forest: "#2D5A3D",
        green: "#4C8055",
        amber: {
          DEFAULT: "#E08A2B",
          deep: "#C9741C",
        },
        clay: "#C4553B",
        mist: "#3A4740",
        line: "#E2DCCE",
        "ink-muted": "#3A4740",
        "body-muted": "#3A4740",
        "amber-text": "#3A2406",
        "mast-sub": "#F5F1E8",
        "mast-meta": "#C9D2CB",
        body: "#3A4740",
        "warm-white": "#F5F1E8",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "22px",
      },
      fontFamily: {
        display: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
        body: ["Satoshi", "system-ui", "sans-serif"],
        sans: ["Satoshi", "system-ui", "sans-serif"],
        serif: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        "amber-glow": "0 8px 20px rgba(224, 138, 43, 0.32)",
        "amber-glow-hover": "0 12px 26px rgba(224, 138, 43, 0.42)",
      },
      transitionTimingFunction: {
        brand: "var(--ease)",
      },
      fontSize: {
        "display-xl": [
          "clamp(48px,7.2vw,104px)",
          { lineHeight: "0.94", letterSpacing: "-0.01em", fontWeight: "300" },
        ],
        display: [
          "34px",
          { lineHeight: "0.96", letterSpacing: "-0.01em", fontWeight: "300" },
        ],
        "card-title": [
          "20px",
          { lineHeight: "1.12", letterSpacing: "-0.005em", fontWeight: "300" },
        ],
      },
      fontWeight: {
        // One step lighter than Tailwind defaults sitewide
        thin: "100",
        extralight: "200",
        light: "200",
        normal: "300",
        medium: "300",
        semibold: "400",
        bold: "500",
        extrabold: "600",
        black: "700",
      },
      letterSpacing: {
        tighter: "-0.015em",
        tight: "-0.01em",
        normal: "0.012em",
        wide: "0.04em",
        wider: "0.06em",
        eyebrow: "0.16em",
        caption: "0.16em",
        sub: "0.02em",
      },
      keyframes: {
        ticker: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "orb-ripple": {
          "0%": { transform: "translate(-50%, -50%) scale(1)", opacity: "0.6" },
          "100%": {
            transform: "translate(-50%, -50%) scale(3.5)",
            opacity: "0",
          },
        },
      },
      animation: {
        ticker: "ticker 32s linear infinite",
        "op-marquee": "ticker 26s linear infinite",
        "orb-ripple": "orb-ripple 1s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
