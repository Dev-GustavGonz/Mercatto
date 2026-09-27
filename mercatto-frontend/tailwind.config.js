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
          primary: '#0F172A',
          accent: '#8B5CF6',
          dark: '#1E1B4B',
          light: '#F5F3FF'
        }
      }
    },
  },
  plugins: [],
}
