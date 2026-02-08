/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark navy base
        navy: {
          950: '#0a0e1a',
          900: '#0d1321',
          800: '#111827',
          700: '#1a2235',
          600: '#243049',
          500: '#2e3d5f',
        },
        // Teal/cyan accent (primary)
        accent: {
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        // Soft pastel card colors
        pastel: {
          blue: '#dbeafe',
          pink: '#fce7f3',
          yellow: '#fef9c3',
          green: '#d1fae5',
          lavender: '#e8e0ff',
          peach: '#ffe8cc',
        },
      },
    },
  },
  plugins: [],
}
