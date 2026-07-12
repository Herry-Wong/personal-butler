/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#FFF5F0",
          100: "#FFE8DD",
          200: "#FFD1BC",
          300: "#FFB394",
          400: "#FF9A56",
          500: "#FF7B35",
          600: "#FF6B35",
          700: "#E85A25",
          800: "#C44A1E",
          900: "#9E3B18",
        },
        secondary: {
          mint: "#4ECDC4",
          lavender: "#9B88FF",
          coral: "#FF6B6B",
          sunflower: "#FFD93D",
        },
        neutral: {
          50: "#FAF8F5",
          100: "#F5F2ED",
          200: "#E8E4DF",
          300: "#D4CFC9",
          400: "#A8A39D",
          500: "#7A7670",
          600: "#5C5853",
          700: "#45423E",
          800: "#2D3436",
          900: "#1A1C1E",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["Noto Sans SC", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(0, 0, 0, 0.08)",
        cardHover: "0 8px 32px -4px rgba(0, 0, 0, 0.12)",
        glass: "0 8px 32px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
