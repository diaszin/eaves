/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    colors: {
      primary: {
        min: "#76B5E1",
        max: "#19648C",
      },
      secondary: {
        min: "#FBF0FF",
        max: "#65487a",
      },
      customblack: "#1F1926",
      customgray: "#71787F",
    },
    fontFamily: {
      primary: ["Manrope_400Regular", "sans-serif"],
      secondary: ["OpenSans_400Regular", "sans-serif"],
    },
    extend: {},
  },
  plugins: [],
};
