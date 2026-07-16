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
        // 苹果风格色彩系统
        primary: {
          50: "#E8F2FE",
          100: "#D1E5FD",
          200: "#A3CBFB",
          300: "#75B2F9",
          400: "#4798F7",
          500: "#0071E3",  // 苹果蓝
          600: "#0062C4",
          700: "#0054A8",
          800: "#00458A",
          900: "#00376D",
        },
        neutral: {
          50: "#F5F5F7",   // 苹果灰白背景
          100: "#E8E8ED",
          200: "#D2D2D7",
          300: "#A1A1A6",
          400: "#86868B",  // 苹果中灰
          500: "#6E6E73",
          600: "#515154",
          700: "#3A3A3C",
          800: "#1D1D1F",  // 苹果近黑
          900: "#000000",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "PingFang SC",
          "Helvetica Neue",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        cardHover: "0 4px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
