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
        // Canva Neo-Brutalist Design Tokens
        paper: "#FFF9EE",
        ink: "#14201A",
        "seed-lime": "#C8EB5A",
        "tea-butter": "#FFE27A",
        "kit-coral": "#FF6A3D",
        "pistachio-sage": "#DCEBC0",
        seedly: {
          primary: "#3E5C48",     // Rich sage / deep botanical green (WCAG AA compliant: 7.03:1 on cream)
          dark: "#14201A",        // Aligned to Canva deep ink
          light: "#EAEFEA",       // Whisper sage tint
          forest: "#16281F",      // Deepest botanical contrast
          soft: "#F4F7F4",        // Soft tinted surface
          stone: "#F2EDE4",       // Soft beige / stone
        },
        cream: "#FFF9EE",         // Aligned to Canva paper
        ivory: "#FFFFFF",
        charcoal: "#14201A",      // Aligned to Canva deep ink
        "muted-gray": "#5F6660",  // Refined stone gray
        "border-gray": "#14201A", // 2px ink border
        sand: "#F4EFE6",
        terracotta: "#FF6A3D",
        honey: "#FFE27A",
        lime: {
          DEFAULT: "#C8EB5A",
          bright: "#C8EB5A",
          hover: "#B8DA48",
        },
        botanical: {
          deep: "#08150E",
          dark: "#0B1D14",
          surface: "#10261B",
          card: "rgba(16, 38, 27, 0.58)",
          sage: "#DCEBC0",
        },
      },
      fontFamily: {
        grotesk: ["var(--font-grotesk)", "Space Grotesk", "sans-serif"],
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "DM Sans", "Roboto", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(27, 30, 28, 0.04), 0 4px 12px rgba(27, 30, 28, 0.03)",
        card: "0 2px 8px rgba(31, 56, 43, 0.04), 0 12px 28px rgba(31, 56, 43, 0.06)",
        hover: "0 4px 14px rgba(31, 56, 43, 0.08), 0 18px 36px rgba(31, 56, 43, 0.1)",
        dropdown: "0 12px 36px rgba(27, 30, 28, 0.12)",
        "brutal-sm": "2px 2px 0px #14201A",
        brutal: "4px 4px 0px #14201A",
        "brutal-lg": "6px 6px 0px #14201A",
        "brutal-xl": "8px 8px 0px #14201A",
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
