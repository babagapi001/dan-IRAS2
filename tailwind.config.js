/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define your custom colors here
        primary: '#238E3B', // Example color
        secondary: '#00ff00', // Example color
      },
    },
  },
  plugins: [],
}
