import { Text } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useSession } from "@/hooks/useSession";
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
      screenOptions={{
        headerShown: false,
        ...transition,
      }}
    ></Stack>
  );
}
