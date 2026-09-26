/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mercatto: {
          primary: '#2563EB',
          accent: '#FF3B3B',
          dark: '#111827',
          light: '#F4F5F8'
        }
      }
    },
  },
  plugins: [],
}
