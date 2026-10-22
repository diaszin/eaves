import { useMutation, useQuery } from "@tanstack/react-query";
import { View, Text, TouchableOpacity } from "react-native";
import ErrorBottomSheet from "@/components/ErrorBottomSheet";
import surveyService from "../services/survey.service";
import { ErrorBoundaryProps, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { CgChevronLeft } from "react-icons/cg";
import AnswersGrid from "../components/answers-grid.component";
import { AxiosError } from "axios";
import {
  AnswerPHQSurveyData,
  DoesPHQ9QuestionReponse,
} from "../services/survey.type";
import SuccessBottomSheet from "@/components/SuccesssBottomSheet";

export default function PHQScreen() {
  const [step, setStep] = useState<number>(0);
  const [data, setData] = useState<
    {
      questionId: number;
      answerId: number;
    }[]
  >([]);
  const [openSuccessModal, setOpenSuccessModal] = useState<boolean>(false);
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
      setOpenSuccessModal(true);
    },
  });

  const doesPhq9Mutation = useMutation<
    DoesPHQ9QuestionReponse,
    AxiosError,
    AnswerPHQSurveyData[]
  >({
    mutationKey: ["survey", "phq", "does"],
    mutationFn: (data) => surveyService.doesPHQ9Questions(data),
    onSuccess: (data) => {
      console.log(data);
      return data;
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

  const isLastStep = step == questions.length - 1;

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

            const updatedData = [...data];
            updatedData[step] = questionResponse;
            setData(updatedData);

            if (step == 1) {
              doesPhq9Mutation.mutate(updatedData, {
                onSuccess: (data) => {
                  if (!data.does) {
                    surveyMutation.mutate(updatedData);
                  } else {
                    next();
                  }
                },
              });
            } else {
              if (isLastStep) {
                surveyMutation.mutate(updatedData);
              } else {
                next();
              }
            }
          }}
        />
        <SuccessBottomSheet
          messsage="Obrigado pela sua resposta"
          isOpen={openSuccessModal}
          onDismiss={() => {
            setOpenSuccessModal(false);
            router.navigate("/(app)/(authenticated)/(home)");
          }}
        />
      </View>
    </View>
  );
}
