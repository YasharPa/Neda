/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial", "sans-serif"],
      },
      colors: {
        // צבעי מותג לאפליקציה (כחול-אינדיגו)
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // צבע מרכזי בכפתורים
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // צבעי רקע למצב כהה (סלייט אלגנטי ולא שחור)
        dark: {
          bg: '#0f172a', // slate-900
          surface: '#1e293b', // slate-800
          border: '#334155', // slate-700
          text: '#f8fafc', // slate-50
          muted: '#94a3b8', // slate-400
        }
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
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        }
      },
      animation: {
        "slide-up": "slideUp 0.4s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        overlayFadeIn: "overlayFadeIn 0.3s ease-out",
        formSlideIn: "formSlideIn 0.3s ease-out",
        "spin-slow": "spinSlow 3s linear infinite",
      },
    },
  },
  plugins: [],
};
