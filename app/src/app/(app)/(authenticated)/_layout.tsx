import { Text } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useSession } from "@/hooks/useSession";
import ScreenFade from "@/shared/navigation/web-screen-fade";
import { useScreenTransition } from "@/shared/navigation/transitions";

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const transition = useScreenTransition();

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack
      screenLayout={({ children }) => <ScreenFade>{children}</ScreenFade>}
      screenOptions={{
        headerShown: false,
        ...transition,
      }}
    ></Stack>
  );
}
