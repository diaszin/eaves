import { useMutation, useQuery } from "@tanstack/react-query";
import { View, Text, TouchableOpacity } from "react-native";
import ErrorBottomSheet from "@/components/ErrorBottomSheet";
import surveyService from "../services/survey.service";
import { ErrorBoundaryProps, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { CgChevronLeft } from "react-icons/cg";
import AnswersGrid from "../components/answers-grid.component";
import { AxiosError } from "axios";
import { AnswerPHQSurveyData } from "../services/survey.type";

export default function PHQScreen() {
  const [step, setStep] = useState<number>(0);
  const [data, setData] = useState<
    {
      questionId: number;
      answerId: number;
    }[]
  >([]);
  const router = useRouter();

  const questionQuery = useQuery({
    queryKey: ["survey", "phq"],
    queryFn: () => surveyService.getQuestions(),
    staleTime: 60_000,
  });

  const surveyMutation = useMutation<any, AxiosError, AnswerPHQSurveyData[]>({
    mutationKey: ["survey", "phq"],
    mutationFn: (data) => surveyService.answerPHQSurvey(data),
    onSuccess: () => {
      router.navigate("/(app)/(authenticated)/(home)");
    },
  });

  if (questionQuery.error) {
    throw questionQuery.error;
  }

  if (!questionQuery.isFetched) {
    return null;
  }

  if (questionQuery.isFetched && !questionQuery.data) {
    throw new Error(
      "Não possível obter as suas perguntas diárias! Tente novamente mais tarde",
    );
  }

  const questions = questionQuery.data!;
  const previous = () =>
    setStep((value) => {
      if (value > 0) {
        value--;
      }

      return value;
    });

  const next = () =>
    setStep((value) => {
      if (value < questions.length - 1) {
        value++;
      }

      return value;
    });

  console.log(data);

  return (
    <View className="h-full">
      <Stack.Screen
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Como está você hoje?",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (step == 0) {
                  router.back();
                } else {
                  previous();
                }
              }}
            >
              <CgChevronLeft />
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex flex-col justify-center gap-4 px-2">
        <View className="flex justify-center items-center w-full">
          <Text className="text-lg text-secondary-max font-bold">
            {questions[step].title}
          </Text>
        </View>

        <AnswersGrid
          data={questions[step].answers}
          onClick={(answer) => {
            const questionResponse = {
              answerId: answer,
              questionId: questions[step].id,
            };

            setData((currentData) => {
              const existingIndex = currentData.at(step);

              if (!existingIndex) {
                return [...currentData, questionResponse];
              } else {
                currentData[step] = questionResponse;
              }

              return currentData;
            });

            if (step == questions.length - 1) {
              surveyMutation.mutate(data);
            } else {
              next();
            }
          }}
        />
      </View>
    </View>
  );
}
