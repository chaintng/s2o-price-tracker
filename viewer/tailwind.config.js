/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f1117",
        card: "#1a1d26",
        border: "#2a2e39",
        muted: "#787b86",
        bull: "#26a69a",
        bear: "#ef5350",
        accent: "#2962ff",
      },
    },
  },
};
