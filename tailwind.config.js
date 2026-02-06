/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4A90E2", // Serene Blue
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F7CAC9", // Rose Quartz
          foreground: "#1F2937",
        },
        background: "#FFFFFF",
        foreground: "#1F2937", // Gray-800
        muted: {
          DEFAULT: "#F3F4F6", // Gray-100
          foreground: "#6B7280", // Gray-500
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1F2937",
        },
        border: "#E5E7EB",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};