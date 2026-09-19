import { Stack } from "expo-router";
import { Manrope_400Regular } from "@expo-google-fonts/manrope";
import { OpenSans_400Regular } from "@expo-google-fonts/open-sans";
import { useFonts } from "expo-font";

import "../../global.css";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    OpenSans_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
