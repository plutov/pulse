/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
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
        border: "#292524",
        input: "#292524",
        ring: "#d6d3d1",
        background: "#0c0a09",
        foreground: "#fafafa",
        primary: {
          DEFAULT: "#fafafa",
          foreground: "#1c1917",
        },
        secondary: {
          DEFAULT: "#292524",
          foreground: "#fafafa",
        },
        destructive: {
          DEFAULT: "#991b1b",
          foreground: "#fafafa",
        },
        muted: {
          DEFAULT: "#292524",
          foreground: "#a8a29e",
        },
        accent: {
          DEFAULT: "#292524",
          foreground: "#fafafa",
        },
        popover: {
          DEFAULT: "#0c0a09",
          foreground: "#fafafa",
        },
        card: {
          DEFAULT: "#0c0a09",
          foreground: "#fafafa",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
