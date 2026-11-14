import { useAuth } from "@/hooks/useAuth";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MotivationalText from "@/templates/motivational-text";
import DailySurvey from "@/templates/daily-survey";
import GetRecentlyAppointments from "@/templates/get-recently-appointments";

export default function HomePage() {
  const currentuser = useAuth()!;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-col m-2 px-5 gap-6 ">
          <View>
            <Text className="text-[1.5rem] font-primary-regular ">
              Olá, {currentuser.profile.name.split(" ")[0]}!
            </Text>
            <MotivationalText />
          </View>
          <DailySurvey />
          <GetRecentlyAppointments />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
