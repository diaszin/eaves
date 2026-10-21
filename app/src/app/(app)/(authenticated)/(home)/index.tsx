import { useAuth } from "@/hooks/useAuth";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function HomePage() {
  const currentuser = useAuth();


  return (
    <View>
      <Text className="text-primary font-primary ">
        Edit /a/index.tsx to this screen.
      </Text>
      <Text className="text-primary font-secondary ">
        <Link href="/(app)/(authenticated)/surveys/phq">Mostrar modal</Link>
      </Text>
    </View>
  );
}
