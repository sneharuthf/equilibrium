/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        equilibrium: {
          blue: "#5B7FDE",
          purple: "#8B7CF6",
          soft: "#EEF2FF",
          dark: "#1E1B3A",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
