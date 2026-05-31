import type { Config } from "tailwindcss";

/**
 * Design tokens from `plan/design/FoodTech_Theme_Fresh_Sustainability_Minimal (1).md`
 * and UI-DESIGN-HANDOFF.md. Colors/fonts reference CSS custom properties declared in
 * `app/globals.css` (`:root`) so the same `--color-*` / `--font-*` tokens are usable both
 * as Tailwind utilities (`bg-primary`) and via `var()` in any raw CSS.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-deep": "var(--color-primary-deep)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        text: "var(--color-text)",
        muted: "var(--color-muted)",
        "muted-2": "var(--color-muted-2)",
        border: "var(--color-border)",
        "card-bg": "var(--color-card-bg)",
        "surface-light": "var(--color-surface-light)",
        "tag-green-bg": "var(--color-tag-green-bg)",
        "tag-green-text": "var(--color-tag-green-text)",
        "tag-orange-bg": "var(--color-tag-orange-bg)",
        "tag-orange-text": "var(--color-tag-orange-text)",
        "tag-safe-bg": "var(--color-tag-safe-bg)",
        "tag-safe-text": "var(--color-tag-safe-text)",
        "tag-neutral-bg": "var(--color-tag-neutral-bg)",
        "tag-neutral-text": "var(--color-tag-neutral-text)",
        error: "var(--color-error)",
        "error-bg": "var(--color-error-bg)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        heading: ["var(--font-heading)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      spacing: {
        "sp-1": "4px",
        "sp-2": "8px",
        "sp-3": "12px",
        "sp-4": "16px",
        "sp-5": "20px",
        "sp-6": "24px",
        "sp-8": "32px",
        "sp-10": "40px",
        "sp-12": "48px",
        "sp-16": "64px",
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        full: "999px",
      },
      boxShadow: {
        card: "0 10px 30px rgba(40, 54, 24, 0.06)",
        dropdown: "0 4px 16px rgba(40, 54, 24, 0.1)",
        elevated: "0 18px 50px rgba(40, 54, 24, 0.10)",
      },
      maxWidth: {
        content: "1200px",
        article: "720px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // UI-DESIGN-HANDOFF.md §3.4 — modal entry: translateY + scale + opacity, matches
        // plan/design/styles.css:1181-1184 (@keyframes modal-pop). Motion-reduce suppresses
        // this via the `motion-safe:animate-modal-pop` utility (AC §4.10 animation policy).
        "modal-pop": {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        // Card-grid stagger entry (UI-DESIGN-HANDOFF.md §4.10); per-child delay set inline.
        "fade-up": "fade-up 0.4s ease both",
        // Modal sheet entry — cubic-bezier matches the prototype's spring feel (styles.css:1178).
        "modal-pop": "modal-pop 280ms cubic-bezier(0.2, 0.9, 0.3, 1.2) both",
      },
    },
  },
  plugins: [],
};
export default config;
