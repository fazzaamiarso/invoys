/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: 'Inter, sans-serif',
      },
      colors: {
        primary: '#4549f4',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
