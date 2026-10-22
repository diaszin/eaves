import { useAuth } from "@/hooks/useAuth";
import { ScrollView } from "@expo/ui";
import { Link } from "expo-router";
import { CgChevronRight } from "react-icons/cg";
import { useEffect, useRef, useState } from "react";
import {
  MdChevronRight,
  MdFrontHand,
  MdHandshake,
  MdSafetyDivider,
  MdTimelapse,
} from "react-icons/md";
import { Animated, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    <Animated.Text
      style={{ opacity, fontSize: 12, color: "#DADADA"  }}
    >
      {motivationalTexts[index]}
    </Animated.Text>
  );
}

export default function HomePage() {
  const currentuser = useAuth()!;

  return (
    <SafeAreaView>
      <ScrollView>
        <View className="flex flex-col m-2 gap-6">
          <View>
            <Text className="text-[1.5rem] font-primary-regular ">Olá, {currentuser.profile.name.split(" ")[0]}!</Text>
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
            <Link
              href="/(app)/(authenticated)/surveys/phq"
              className="flex items-center justify-center w-full bg-primary-min py-3"
            >
              <View className="flex flex-row items-center justify-center gap-2">
                <Text className="text-white font-primary-semibold">
                  Responder
                </Text>
                <MdChevronRight size={18} className="text-white" />
              </View>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
