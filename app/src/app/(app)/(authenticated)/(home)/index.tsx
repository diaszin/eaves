import { useAuth } from "@/hooks/useAuth";
import { ScrollView } from "@expo/ui";
import { Tabs, useRouter } from "expo-router";
import { MdHome, MdPerson } from "react-icons/md";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MotivationalText from "@/templates/motivational-text";
import DailySurvey from "@/templates/daily-survey";
import GetRecentlyAppointments from "@/templates/get-recently-appointments";

export default function HomePage() {
  const currentuser = useAuth()!;

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="flex flex-col m-2 px-5 gap-6 ">
          <View>
            <Text className="text-[1.5rem] font-primary-regular ">
              Olá, {currentuser.profile.name.split(" ")[0]}!
            </Text>
            <MotivationalText />
            <GetRecentlyAppointments />
          </View>
          <DailySurvey />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
