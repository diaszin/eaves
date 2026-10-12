import { useAuth } from "@/hooks/useAuth";
import { Text, View } from "react-native";

export default function HomePage() {
  const currentuser = useAuth();

  console.log(currentuser);

  return (
    <View>
      <Text className="text-primary font-primary ">
        Edit /a/index.tsx to this screen.
      </Text>
      <Text className="text-primary font-secondary ">
        Edit /a/index.tsx to this screen.
      </Text>
    </View>
  );
}
