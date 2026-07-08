/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgba(var(--background), <alpha-value>)',
        foreground: 'rgba(var(--foreground), <alpha-value>)',
        card: {
          DEFAULT: 'rgba(21, 23, 30, 0.7)',
          foreground: '#f8fafc',
        },
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        secondary: {
          DEFAULT: '#10b981',
        },
        danger: {
          DEFAULT: '#ef4444',
        },
        warning: {
          DEFAULT: '#f59e0b',
        },
        border: 'rgba(255, 255, 255, 0.08)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
