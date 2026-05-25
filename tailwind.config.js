/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial", "sans-serif"],
      },
      keyframes: {
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        overlayFadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        formSlideIn: {
          from: { opacity: "0", transform: "translateY(-30px) scale(0.95)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },

      animation: {
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        overlayFadeIn: "overlayFadeIn 0.3s ease-out",
        formSlideIn: "formSlideIn 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
