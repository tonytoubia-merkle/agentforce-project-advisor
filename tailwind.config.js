/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f0f7f4',
          100: '#d9ebe2',
          200: '#b5d7c7',
          300: '#86bca5',
          400: '#5a9c82',
          500: '#3d7d66',
          600: '#2e6451',
          700: '#265042',
          800: '#214136',
          900: '#1c362e',
        },
      },
    },
  },
  plugins: [],
};
