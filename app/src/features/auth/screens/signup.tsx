import { createContext, useState } from "react";
import { View, Text, Image, TouchableOpacity, Pressable } from "react-native";
import PersonalStep from "./signup_steps/personal_step_screen";
import { MultiStepContext } from "../contexts/multiStepContext";
import CommunicationStep from "./signup_steps/communication_step_screen";
import AuthStepScreen from "./signup_steps/auth_step_screen";
import { MultiStepData, SignupMutationData } from "../types/signup.type";
import { FormOptions, useForm } from "@tanstack/react-form";
import authService from "../services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import ErrorBottomSheet from "@/components/ErrorBottomSheet";
import { AxiosError } from "axios";
import { MdChevronLeft } from "react-icons/md";

async function signup(
  fullname: string,
  email: string,
  password: string,
  birthDate: Date,
  document: string,
  race: string,
  incomeBraket: string,
  emergencyPhone: string,
  cep: string,
) {
  await authService.signup({
    birthDate: birthDate.toISOString(),
    email: email,
    password: password,
    fullname: fullname,
    document: document,
    race: race,
    incomeBraket: incomeBraket,
    emergencyPhone: emergencyPhone,
    cep: cep,
  });
}

export default function SignUpScreen() {
  const { email, redirectByMicrosoftLogin } = useLocalSearchParams<{
    email?: string;
    redirectByMicrosoftLogin?: string;
  }>();

  const signedByMicrosoft = redirectByMicrosoftLogin
    ? Number.parseInt(redirectByMicrosoftLogin) > 0
    : false;

  const [step, setStep] = useState<number>(1);
  const router = useRouter();

  const mutation = useMutation<any, AxiosError, SignupMutationData>({
    mutationKey: ["auth", "signup"],
    mutationFn: (value: SignupMutationData) =>
      signup(
        value.fullname,
        value.email,
        value.password,
        value.birthDate,
        value.document,
        value.race,
        value.incomeBraket,
        value.emergencyPhone,
        value.localization,
      ),
    onSuccess: () => {
      router.replace("/(auth)/sign-in");
    },
  });

  const form = useForm({
    defaultValues: {
      auth: {
        email: email,
      },
    } as MultiStepData,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({
        birthDate: value.personal.birthDate,
        email: value.auth.email,
        password: value.auth.password,
        fullname: value.personal.fullname,
        document: value.personal.document,
        race: value.personal.race,
        incomeBraket: value.personal.incomeBraket,
        emergencyPhone: value.communication.emergencyPhone,
        localization: value.communication.localization,
      });
    },
  });

  return (
    <MultiStepContext.Provider
      value={{
        next: () => {
          setStep((value) => value + 1);
        },
        previous: () => {
          setStep((value) => value - 1);
        },
        step: step,
        form: form,
      }}
    >
      <View className="bg-secondary-min h-screen p-4">
        <View className="flex flex-col items-center justify-center gap-1">
          <Image
            style={{
              width: 79,
              height: 79,
            }}
            source={require("@/assets/images/icon.png")}
          />
          <Text className="text-3xl text-secondary-max font-primary-bold">
            Crie sua conta
          </Text>
          <Text className="font-secondary-regular text-[0.8rem] text-customblack-min">
            Leva menos de 1 minuto para dar o primeiro passo.
          </Text>

          {signedByMicrosoft && (
            <View className="bg-blue-100 flex items-center justify-center h-10 w-30 p-7 my-2">
              <Text className="text-center">
                Você não possue uma conta! {"\n"}
                Realize o cadastro antes de fazer o login
              </Text>
            </View>
          )}
          {step == 1 && <PersonalStep />}
          {step == 2 && <CommunicationStep />}
          {step == 3 && <AuthStepScreen />}

          <View className="flex flex-col items-center justify-center">
            <Text className="font-secondary-regular text-sm text-gray-600">
              Já tem uma conta?{" "}
              <Link
                href="/(auth)/sign-in"
                className="text-primary-max font-secondary-bold text-[1rem]"
              >
                Faça login
              </Link>
            </Text>
          </View>
        </View>
        <ErrorBottomSheet error={mutation.error} />
      </View>
    </MultiStepContext.Provider>
  );
}
