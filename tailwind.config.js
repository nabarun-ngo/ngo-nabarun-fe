/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

// Let's create a plugin that adds utilities!
const capitalizeFirst = plugin(function({ addUtilities }) {
    const newUtilities = {
        '.capitalize-first:first-letter': {
            textTransform: 'uppercase',
        },
    }
    addUtilities(newUtilities, ['responsive', 'hover'])
})
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--primary-50)',
          100: 'var(--primary-100)',
          200: 'var(--primary-200)',
          300: 'var(--primary-300)',
          400: 'var(--primary-400)',
          500: 'var(--primary-500)',
          600: 'var(--primary-600)',
          700: 'var(--primary-700)',
          800: 'var(--primary-800)',
          900: 'var(--primary-900)',
        }
      }
    },
  },
  plugins: [capitalizeFirst],
}

