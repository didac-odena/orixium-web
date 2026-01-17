/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(from var(--color-bg) r g b / <alpha-value>)",
        surface: "rgb(from var(--color-surface) r g b / <alpha-value>)",
        "surface-2": "rgb(from var(--color-surface-2) r g b / <alpha-value>)",
        "surface-3": "rgb(from var(--color-surface-3) r g b / <alpha-value>)",
        ink: "rgb(from var(--color-ink) r g b / <alpha-value>)",
        "ink-soft": "rgb(from var(--color-ink-soft) r g b / <alpha-value>)",
        muted: "rgb(from var(--color-muted) r g b / <alpha-value>)",
        border: "rgb(from var(--color-border) r g b / <alpha-value>)",
        "border-strong": "rgb(from var(--color-border-strong) r g b / <alpha-value>)",
        accent: "rgb(from var(--color-accent) r g b / <alpha-value>)",
        "accent-2": "rgb(from var(--color-accent-2) r g b / <alpha-value>)",
        success: "rgb(from var(--color-success) r g b / <alpha-value>)",
        warning: "rgb(from var(--color-warning) r g b / <alpha-value>)",
        danger: "rgb(from var(--color-danger) r g b / <alpha-value>)",
        info: "rgb(from var(--color-info) r g b / <alpha-value>)",
        up: "rgb(from var(--color-up) r g b / <alpha-value>)",
        down: "rgb(from var(--color-down) r g b / <alpha-value>)",
        neutral: "rgb(from var(--color-neutral) r g b / <alpha-value>)",
        ring: "rgb(from var(--color-ring) r g b / <alpha-value>)",
        "ring-offset": "rgb(from var(--color-ring-offset) r g b / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
