import { useAuth } from "@/hooks/useAuth";
import { ScrollView } from "@expo/ui";
import { Tabs, useRouter } from "expo-router";
import { MdHome, MdPerson } from "react-icons/md";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MotivationalText from "@/templates/motivational-text";
import DailySurvey from "@/templates/daily-survey";

export default function HomePage() {
  const currentuser = useAuth()!;
  const router = useRouter();

  return (
    <SafeAreaView>
      <ScrollView>
        <Tabs.Screen
          options={{
            title: "Inicio",
            headerShown: true,
            tabBarIcon(props) {
              return (
                <MdHome color={props.color.toString()} size={props.size} />
              );
            },
            headerRight: () => {
              return (
                <View className="flex flex-row m-2 px-5 bg-transparent ">
                  <TouchableOpacity
                    onPress={() => {
                      router.push("/(app)/(authenticated)/profile/menu");
                    }}
                    className="bg-primary-max size-8 rounded-full flex items-center justify-center"
                  >
                    <MdPerson className="text-white" size={20} />
                  </TouchableOpacity>
                </View>
              );
            },
          }}
        />
        <View className="flex flex-col m-2 px-5 gap-6 ">
          <View>
            <Text className="text-[1.5rem] font-primary-regular ">
              Olá, {currentuser.profile.name.split(" ")[0]}!
            </Text>
            <MotivationalText />
          </View>
          <DailySurvey />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
