/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
          soft: "rgb(var(--c-ink-soft) / <alpha-value>)",
          line: "rgb(var(--c-ink-line) / <alpha-value>)",
        },
        bone: {
          DEFAULT: "rgb(var(--c-bone) / <alpha-value>)",
          dim: "rgb(var(--c-bone-dim) / <alpha-value>)",
          faint: "rgb(var(--c-bone-faint) / <alpha-value>)",
        },
        verdigris: {
          DEFAULT: "rgb(var(--c-verdigris) / <alpha-value>)",
          bright: "rgb(var(--c-verdigris-bright) / <alpha-value>)",
          dim: "rgb(var(--c-verdigris-dim) / <alpha-value>)",
        },
        bronze: {
          DEFAULT: "rgb(var(--c-bronze) / <alpha-value>)",
          bright: "rgb(var(--c-bronze-bright) / <alpha-value>)",
          dim: "rgb(var(--c-bronze-dim) / <alpha-value>)",
        },
        scan: {
          DEFAULT: "rgb(var(--c-scan) / <alpha-value>)",
          dim: "rgb(var(--c-scan-dim) / <alpha-value>)",
        },
        rust: {
          DEFAULT: "rgb(var(--c-rust) / <alpha-value>)",
          bright: "rgb(var(--c-rust-bright) / <alpha-value>)",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Work Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(232,226,208,0.06) 1px, transparent 0)",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(16px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        spin3d: {
          "0%": { transform: "rotateY(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        revealUp: {
          "0%": { opacity: 0, transform: "translateY(22px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        tooltipIn: {
          "0%": { opacity: 0, transform: "translate(-50%, 4px) scale(0.96)" },
          "100%": { opacity: 1, transform: "translate(-50%, 0) scale(1)" },
        },
        shine: {
          "0%": { transform: "translateX(-120%) skewX(-15deg)" },
          "100%": { transform: "translateX(220%) skewX(-15deg)" },
        },
      },
      animation: {
        scanline: "scanline 2.8s linear infinite",
        fadeUp: "fadeUp 0.7s ease forwards",
        spin3d: "spin3d 14s linear infinite",
        revealUp: "revealUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards",
        tooltipIn: "tooltipIn 0.15s ease forwards",
        shine: "shine 1.1s ease forwards",
      },
    },
  },
  plugins: [],
}
