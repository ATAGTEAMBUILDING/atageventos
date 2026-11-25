import type { Config } from "tailwindcss";

/**
 * Colors map to CSS custom properties defined in src/index.css so the whole
 * palette is theme-aware (light / dark / system) without duplicating utilities.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        line: "var(--border)",
        line2: "var(--border-2)",
        ink: "var(--text)",
        muted: "var(--muted)",
        faint: "var(--faint)",
        accent: "var(--accent)",
        accent2: "var(--accent-2)",
        accentSoft: "var(--accent-sft)",
        teal: "var(--teal)",
        tealSoft: "var(--teal-sft)",
        good: "var(--good)",
        goodSoft: "var(--good-sft)",
        warn: "var(--warn)",
        warnSoft: "var(--warn-sft)",
        crit: "var(--crit)",
        critSoft: "var(--crit-sft)",
        info: "var(--info)",
        infoSoft: "var(--info-sft)",
        purple: "var(--purple)",
        purpleSoft: "var(--purple-sft)",
        gold: "var(--gold)",
        goldSoft: "var(--gold-sft)",
      },
      fontFamily: {
        sans: ["'IBM Plex Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,27,43,.06), 0 1px 3px rgba(20,27,43,.08)",
      },
    },
  },
  plugins: [],
};

export default config;
