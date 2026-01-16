/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(from var(--color-bg) r g b / <alpha-value>)",
        ink: "rgb(from var(--color-ink) r g b / <alpha-value>)",
        muted: "rgb(from var(--color-muted) r g b / <alpha-value>)",
        border: "rgb(from var(--color-border) r g b / <alpha-value>)",
        accent: "rgb(from var(--color-accent) r g b / <alpha-value>)",
        "accent-2": "rgb(from var(--color-accent-2) r g b / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
