/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0f1117',
          900: '#141720',
          800: '#1a1f2e',
          700: '#1e2435',
          600: '#252b3b',
          500: '#2d3448',
        },
      },
    },
  },
  plugins: [],
}
