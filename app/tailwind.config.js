/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          min: "#76B5E1",
          max: "#19648C",
        },
        secondary: {
          min: "#FBF0FF",
          max: "#65487a",
        },
        customblack: { min: "#40484E", max: "#1F1926" },
        customgray: "#71787F",
        error: "#BB2727"
      },
      fontFamily: {
        "primary-regular": ["Manrope_400Regular"],
        "primary-medium": ["Manrope_500Medium"],
        "primary-semibold": ["Manrope_600SemiBold"],
        "primary-bold": ["Manrope_700Bold"],

        "secondary-regular": ["OpenSans_400Regular"],
        "secondary-medium": ["OpenSans_500Medium"],
        "secondary-semibold": ["OpenSans_600SemiBold"],
        "secondary-bold": ["OpenSans_700Bold"],
      },
    },
  },
  plugins: [],
};
