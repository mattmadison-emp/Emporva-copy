/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          // Primary Brand Colors
          'primary-navy': '#0B1F33',
          'secondary-slate': '#6B7C8F',
          'accent-sand': '#D4B483',
          
          // Neutral Colors
          'neutral-light': '#F9F9FB',
          'neutral-dark': '#333645',
          
          // Semantic aliases for consistency
          'brand': {
            primary: '#0B1F33',
            secondary: '#6B7C8F',
            accent: '#D4B483',
          },
          'background': {
            DEFAULT: '#F9F9FB',
            light: '#F9F9FB',
          },
          'text': {
            primary: '#333645',
            secondary: '#6B7C8F',
            heading: '#0B1F33',
          }
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }
