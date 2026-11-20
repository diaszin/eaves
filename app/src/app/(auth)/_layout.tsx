import { Stack } from "expo-router";
import { useScreenTransition } from "@/shared/navigation/transitions";

export default function AuthLayout() {
  const transition = useScreenTransition();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        ...transition,
        contentStyle: { backgroundColor: "#FBF0FF" },
      }}
    />
  );
}
