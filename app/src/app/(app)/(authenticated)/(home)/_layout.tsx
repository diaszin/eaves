import PressableScale from "@/shared/components/pressable-scale";
import { Tabs, useRouter } from "expo-router";
import {
  MdAutoStories,
  MdCalendarMonth,
  MdHealing,
  MdHome,
  MdPerson,
} from "react-icons/md";
import { View } from "react-native";
import { useTabTransition } from "@/shared/navigation/transitions";
export default function TabLyout() {
  const router = useRouter();
  const transition = useTabTransition();

  return (
    <Tabs screenOptions={transition}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          headerShown: true,
          tabBarIcon(props) {
            return <MdHome color={props.color.toString()} size={props.size} />;
          },
          headerRight: () => {
            return (
              <View className="flex flex-row m-2 px-5 bg-transparent ">
                <PressableScale size="icon"
                  onPress={() => {
                    router.push("/(app)/(authenticated)/profile/menu");
                  }}
                  className="bg-primary-max size-8 rounded-full flex items-center justify-center"
                >
                  <MdPerson className="text-white" size={20} />
                </PressableScale>
              </View>
            );
          },
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Meu diário",
          headerShown: true,
          tabBarIcon({ size, color }) {
            return <MdAutoStories color={color.toString()} size={size} />;
          },
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Procurar consultas",
          headerShown: true,
          tabBarIcon({ size, color }) {
            return <MdHealing color={color.toString()} size={size} />;
          },
        }}
      />
    </Tabs>
  );
}
