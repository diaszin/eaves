import { Text } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/hooks/useSession';


export default function AppLayout() {
  const { session } = useSession();

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return <Stack screenOptions={{
    headerShown: false
  }} />;
}