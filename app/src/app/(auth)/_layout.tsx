import { Stack } from "expo-router";
import ScreenFade from "@/shared/navigation/web-screen-fade";
import { useScreenTransition } from "@/shared/navigation/transitions";

export default function AuthLayout() {
  const transition = useScreenTransition();

  return (
    <Stack
      screenLayout={({ children }) => <ScreenFade>{children}</ScreenFade>}
      screenOptions={{
        headerShown: false,
        ...transition,
        contentStyle: { backgroundColor: "#FBF0FF" },
      }}
    />
  );
}
