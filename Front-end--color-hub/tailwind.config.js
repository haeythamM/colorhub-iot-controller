/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(102, 183, 102)",  // soft green
        background : "rgb(24, 24, 24)",    // dark charcoal
        secondary: "rgb(250, 244, 217)", // light cream
        accent: "rgb(255, 138, 72)",   // warm orange
        highlight: "rgb(234, 218, 122)",  // bright yellow
        link: "rgb(55, 105, 150)",      // muted blue
      },
    },
  },
  plugins: [],
};
