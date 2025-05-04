/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  safelist: [
    'bg-primary',
    'hover:bg-primary/90',
    'text-primary-foreground',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7E3AF2',
        'primary-foreground': '#ffffff',
        foreground: 'rgb(var(--foreground-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Circular Std Book', 'system-ui', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
