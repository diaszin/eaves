import surveyService from "@/features/surveys/services/survey.service";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { MdTimelapse, MdChevronRight, MdCheck } from "react-icons/md";
import { View, Text, TouchableOpacity } from "react-native";

export default function DailySurvey() {
  const verifyDailySurveyQuery = useQuery({
    queryKey: ["survey", "daily", "phq", "answered"],
    queryFn: () => surveyService.verifyUserIsAnsweredDailySurvey(),
  });
  const router = useRouter();

  return (
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
  );
}
