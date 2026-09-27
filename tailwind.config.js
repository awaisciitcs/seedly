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
          primary: "#829C83",
          dark: "#506A56",
          light: "#E9EFEA",
          forest: "#384B3D",
          deep: "#243227",
          soft: "#F2F6F3",
        },
        cream: "#FAF8F2",
        ivory: "#FFFFFF",
        charcoal: "#252825",
        "muted-gray": "#657067",
        "border-gray": "#D9DED9",
        sand: "#F4F0E8",
        terracotta: "#C87D55",
        honey: "#D99B43",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(37, 40, 37, 0.04)",
        card: "0 4px 20px rgba(80, 106, 86, 0.06)",
        hover: "0 10px 30px rgba(80, 106, 86, 0.12)",
        dropdown: "0 10px 40px rgba(37, 40, 37, 0.1)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        pulseSubtle: "pulseSubtle 2.5s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
