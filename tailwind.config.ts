import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#111827",
          muted: "#6B7280",
          faint: "#9CA3AF",
        },
        primary: {
          DEFAULT: "#0F4C81",
          hover: "#1B5FA5",
          tint: "#EAF1F8",
        },
        teal: {
          DEFAULT: "#2E8B8B",
          tint: "#E9F3F3",
        },
        positive: "#4CAF50",
        surface: {
          DEFAULT: "#FFFFFF",
          sub: "#F8FAFC",
        },
        line: "#E5E7EB",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Fluid display scale — clamp keeps hero legible from 360px to 1920px
        hero: ["clamp(2.5rem, 1.2rem + 5.2vw, 5rem)", { lineHeight: "1.04", letterSpacing: "-0.025em" }],
        section: ["clamp(1.875rem, 1.1rem + 3vw, 3.5rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        card: ["clamp(1.25rem, 1rem + 0.9vw, 1.75rem)", { lineHeight: "1.25", letterSpacing: "-0.015em" }],
        metric: ["clamp(2.75rem, 1.8rem + 3.4vw, 4.25rem)", { lineHeight: "0.9", letterSpacing: "-0.03em" }],
        eyebrow: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.16em" }],
      },
      maxWidth: {
        shell: "1240px",
        prose: "68ch",
        read: "800px",
      },
      spacing: {
        section: "clamp(4.5rem, 3rem + 6vw, 9rem)",
      },
      boxShadow: {
        card: "0 1px 2px rgba(17,24,39,0.04), 0 8px 24px -12px rgba(15,76,129,0.10)",
        lift: "0 2px 4px rgba(17,24,39,0.04), 0 18px 40px -16px rgba(15,76,129,0.18)",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      typography: () => ({
        manvi: {
          css: {
            "--tw-prose-body": "#374151",
            "--tw-prose-headings": "#111827",
            "--tw-prose-links": "#0F4C81",
            "--tw-prose-quotes": "#111827",
            "--tw-prose-bullets": "#9CA3AF",
            "--tw-prose-hr": "#E5E7EB",
            "--tw-prose-th-borders": "#E5E7EB",
            "--tw-prose-td-borders": "#E5E7EB",
            "--tw-prose-invert-body": "#D1D5DB",
            "--tw-prose-invert-headings": "#F9FAFB",
            "--tw-prose-invert-links": "#7FB3E0",
            maxWidth: "none",
            fontSize: "1.0625rem",
            lineHeight: "1.75",
            h2: { fontFamily: "var(--font-display)", fontWeight: "600", letterSpacing: "-0.015em", marginTop: "2.5em" },
            h3: { fontFamily: "var(--font-display)", fontWeight: "600", letterSpacing: "-0.01em" },
            h4: { fontWeight: "600" },
            blockquote: {
              fontFamily: "var(--font-display)",
              fontStyle: "normal",
              fontSize: "1.25rem",
              borderLeftWidth: "2px",
              borderLeftColor: "#0F4C81",
              paddingLeft: "1.25rem",
            },
            code: {
              fontWeight: "500",
              backgroundColor: "#F8FAFC",
              padding: "0.15em 0.4em",
              borderRadius: "4px",
            },
            "code::before": { content: '""' },
            "code::after": { content: '""' },
            img: { borderRadius: "10px" },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
