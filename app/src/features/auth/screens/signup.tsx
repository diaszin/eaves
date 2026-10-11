import { createContext, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import PersonalStep from "./signup_steps/personal_step_screen";
import { MultiStepContext } from "../contexts/multiStepContext";
import CommunicationStep from "./signup_steps/communication_step_screen";
import AuthStepScreen from "./signup_steps/auth_step_screen";
import { MultiStepData } from "../types/signup.type";
import { FormOptions, useForm } from "@tanstack/react-form";

export default function SignUpScreen() {
  const [step, setStep] = useState<number>(1);
  const form = useForm({
    defaultValues: {} as MultiStepData,
    onSubmit: (value) => {
      console.log(value);
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
          {step == 1 && <PersonalStep />}
          {step == 2 && <CommunicationStep />}
          {step == 3 && <AuthStepScreen />}
        </View>
      </View>
    </MultiStepContext.Provider>
  );
}
