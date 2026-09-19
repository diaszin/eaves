/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    colors: {
      primary: "#76B5E1",
      secondary: "#65487a",
    },
    fontFamily: {
      primary: ["Manrope_400Regular", "sans-serif"],
      secondary: ["OpenSans_400Regular", "sans-serif"],
    },
    extend: {},
  },
  plugins: [],
};
