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
        seedly: {
          primary: "#3E5C48",     // Rich sage / deep botanical green (WCAG AA compliant: 7.03:1 on cream)
          dark: "#1F382B",        // Deep botanical green
          light: "#EAEFEA",       // Whisper sage tint
          forest: "#16281F",      // Deepest botanical contrast
          soft: "#F4F7F4",        // Soft tinted surface
          stone: "#F2EDE4",       // Soft beige / stone
        },
        cream: "#FAF8F5",         // Warm ivory background
        ivory: "#FFFFFF",
        charcoal: "#1B1E1C",      // Deep charcoal text
        "muted-gray": "#5F6660",  // Refined stone gray
        "border-gray": "#E5E0D6", // Soft stone border
        sand: "#F4EFE6",
        terracotta: "#B86644",
        honey: "#C88B38",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(27, 30, 28, 0.04), 0 4px 12px rgba(27, 30, 28, 0.03)",
        card: "0 2px 8px rgba(31, 56, 43, 0.04), 0 12px 28px rgba(31, 56, 43, 0.06)",
        hover: "0 4px 14px rgba(31, 56, 43, 0.08), 0 18px 36px rgba(31, 56, 43, 0.1)",
        dropdown: "0 12px 36px rgba(27, 30, 28, 0.12)",
      },
      borderRadius: {
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
