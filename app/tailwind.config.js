/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Confident, executive-friendly palette: deep navy as primary,
        // warm neutrals, a restrained gold accent for emphasis only.
        navy: {
          50: "#eef1f6",
          100: "#d6dde8",
          200: "#adbcd1",
          300: "#8497b6",
          400: "#5c749d",
          500: "#3d5580",
          600: "#2c4066",
          700: "#1f2f4d",
          800: "#141f36",
          900: "#0b1220",
          950: "#060a13",
        },
        gold: {
          400: "#d9b871",
          500: "#c8a24e",
          600: "#a9843a",
        },
        surface: {
          light: "#ffffff",
          dark: "#0b1220",
        },
        muted: {
          light: "#f4f5f7",
          dark: "#141f36",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
