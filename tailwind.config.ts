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
        "paper-2": "#F2EEE4",
        ink: "#1A2E22",
        forest: "#2D5A3D",
        green: "#4C8055",
        amber: {
          DEFAULT: "#E08A2B",
          deep: "#C9741C",
        },
        clay: "#C4553B",
        mist: "#5C6B62",
        line: "#E2DCCE",
        "ink-muted": "#33433A",
        "body-muted": "#54635A",
        "amber-text": "#3A2406",
        "mast-sub": "#C9D2CB",
        "mast-meta": "#9DB0A4",
        "body": "#3D4A42",
      },
      borderRadius: {
        sm: "8px",
        md: "14px",
        lg: "22px",
        xl: "28px",
      },
      fontFamily: {
        display: ["var(--font-archivo)", '"Archivo Expanded"', "Archivo", "sans-serif"],
        body: ["var(--font-archivo)", "Archivo", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Fraunces", "Georgia", "serif"],
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
        "display-xl": ["54px", { lineHeight: "1", letterSpacing: "-0.03em", fontWeight: "900" }],
        display: ["34px", { lineHeight: "1.02", letterSpacing: "-0.02em", fontWeight: "800" }],
        "card-title": ["20px", { lineHeight: "1.12", letterSpacing: "-0.01em", fontWeight: "800" }],
      },
      letterSpacing: {
        eyebrow: "0.22em",
        caption: "0.14em",
      },
    },
  },
  plugins: [],
};

export default config;
