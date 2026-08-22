import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  safelist: [
    "nb-card",
    "nb-card-yellow",
    "nb-btn-primary",
    "nb-btn-danger",
    "nb-input",
    "nb-badge",
    "nb-badge-pink",
    "nb-header",
    "nb-sidebar",
    "nb-table",
    "glass-btn",
    "glass-btn-dark",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
