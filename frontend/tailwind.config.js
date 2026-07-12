/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#3B82F6",
        brand2: "#22D3EE",
        primary: "#3B82F6",
        success: "#22C55E",
        danger: "#F43F5E",
        warning: "#F59E0B",
        surface: "#0E1424",
        card: "#121A2E",
        border: "#223052",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
