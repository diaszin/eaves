import { Slot, Stack } from "expo-router";
import { Manrope_400Regular } from "@expo-google-fonts/manrope";
import { OpenSans_400Regular } from "@expo-google-fonts/open-sans";
import { useFonts } from "expo-font";

import "../../global.css";
import AuthProvider from "@/components/providers/AuthProvider";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    OpenSans_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
