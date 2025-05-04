/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'system-ui', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
