/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clean Studio Monochrome Design Tokens
        paper: "#FFFFFF",
        ink: "#111827",
        "seed-lime": "#F5F5F4",
        "tea-butter": "#F6F5F3",
        "kit-coral": "#D97706",
        "pistachio-sage": "#F5F5F4",
        seedly: {
          primary: "#111827",     // Clean obsidian black
          dark: "#111827",        // Clean obsidian black
          light: "#F5F5F4",       // Soft alabaster
          forest: "#111827",      // Primary text
          soft: "#F8F8F7",        // Secondary background
          stone: "#F5F5F4",       // Soft neutral surface
        },
        cream: "#FFFFFF",         // Clean white canvas
        ivory: "#FFFFFF",
        charcoal: "#111827",      // Obsidian
        "muted-gray": "#6B7280",  // Refined neutral gray
        "border-gray": "#E5E7EB", // 1px clean border
        sand: "#F5F5F4",
        terracotta: "#D97706",
        honey: "#F59E0B",
        lime: {
          DEFAULT: "#F5F5F4",
          bright: "#F5F5F4",
          hover: "#E5E7EB",
        },
        botanical: {
          deep: "#0B0F19",
          dark: "#111827",
          surface: "#F8F8F7",
          card: "rgba(255, 255, 255, 0.95)",
          sage: "#F5F5F4",
        },
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "Roboto", "sans-serif"],
        roboto: ["var(--font-roboto)", "Roboto", "sans-serif"],
        heading: ["var(--font-roboto)", "Roboto", "sans-serif"],
        grotesk: ["var(--font-roboto)", "Roboto", "sans-serif"],
        serif: ["var(--font-roboto)", "Roboto", "sans-serif"],
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0, 0, 0, 0.04)",
        subtle: "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.03)",
        card: "0 2px 8px rgba(0, 0, 0, 0.04), 0 12px 28px rgba(0, 0, 0, 0.06)",
        hover: "0 4px 14px rgba(0, 0, 0, 0.06), 0 18px 36px rgba(0, 0, 0, 0.09)",
        dropdown: "0 12px 36px rgba(0, 0, 0, 0.12)",
        "brutal-sm": "0 1px 3px rgba(0, 0, 0, 0.05)",
        brutal: "0 4px 14px rgba(0, 0, 0, 0.05)",
        "brutal-lg": "0 12px 28px rgba(0, 0, 0, 0.08)",
        "brutal-xl": "0 20px 40px rgba(0, 0, 0, 0.12)",
      },
      borderRadius: {
        "28px": "28px",
        "32px": "32px",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        pulseSubtle: "pulseSubtle 2.5s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
