import { useAuth } from "@/hooks/useAuth";
import { ScrollView } from "@expo/ui";
import { Link, Stack, Tabs, useRouter } from "expo-router";
import { CgChevronRight } from "react-icons/cg";
import { useEffect, useRef, useState } from "react";
import {
  MdCheck,
  MdChevronRight,
  MdFrontHand,
  MdHandshake,
  MdHome,
  MdPerson,
  MdSafetyDivider,
  MdTimelapse,
} from "react-icons/md";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import surveyService from "@/features/surveys/services/survey.service";

const motivationalTexts = [
  "Você é capaz de superar os desafios de hoje.",
  "Cada pequeno passo também é progresso.",
  "Cuide de você: seu bem-estar importa.",
  "Acredite no caminho que está construindo.",
];

function MotivationalText() {
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
      setIndex((current) => (current + 1) % motivationalTexts.length);
    }, 4000);

    return () => {
      clearInterval(interval);
      opacity.stopAnimation();
    };
  }, [opacity]);

  return (
    <Animated.Text style={{ opacity, fontSize: 12, color: "gray" }}>
      {motivationalTexts[index]}
    </Animated.Text>
  );
}

export default function HomePage() {
  const verifyDailySurveyQuery = useQuery({
    queryKey: ["survey", "daily", "phq", "answered"],
    queryFn: () => surveyService.verifyUserIsAnsweredDailySurvey(),
  });
  const router = useRouter();

  const currentuser = useAuth()!;

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
                  <TouchableOpacity className="bg-primary-max size-8 rounded-full flex items-center justify-center">
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
          <View className="group w-full flex gap-4 border-2 shadow shadow-slate-400 p-4 rounded-md  border-secondary-max active:bg-secondary-min">
            <View className="w-full flex flex-col gap-2">
              <View className="flex flex-row items-center">
                <View className="flex flex-row shadow py-1 px-4 rounded gap-2">
                  <MdTimelapse size={14} className="text-secondary-max" />
                  <Text className="text-[0.6rem] text-secondary-max font-primary-semibold">
                    1 min
                  </Text>
                </View>
              </View>
              <Text className="group-active:text-secondary-max text-[1.2rem]">
                Como você está hoje?
              </Text>
              <Text className="group-active:text-secondary-max text-[0.7rem] w-60 text-customgray">
                Uma breve reflexão sobre como você está se sentindo hoje.
              </Text>
            </View>
            <TouchableOpacity
              disabled={verifyDailySurveyQuery.data?.answered}
              onPress={() => {
                if (!verifyDailySurveyQuery.data?.answered) {
                  router.push("/(app)/(authenticated)/surveys/phq");
                }
              }}
              className={
                !verifyDailySurveyQuery.data?.answered
                  ? "flex items-center justify-center w-full bg-primary-min py-3"
                  : "flex items-center justify-center w-full bg-success py-3"
              }
            >
              <View className="flex flex-row items-center justify-center gap-2">
                {!verifyDailySurveyQuery.data?.answered ? (
                  <>
                    {" "}
                    <Text className="text-white font-primary-semibold">
                      Responder
                    </Text>
                    <MdChevronRight size={18} className="text-white" />
                  </>
                ) : (
                  <>
                    <Text className="text-white font-primary-semibold">
                      Já respondido
                    </Text>
                    <MdCheck size={18} className="text-white" />
                  </>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
