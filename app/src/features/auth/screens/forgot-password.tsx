import ErrorBottomSheet from "@/components/ErrorBottomSheet";
import SuccessBottomSheet from "@/components/SuccesssBottomSheet";
import InputWithLabel from "@/features/auth/components/input_with_label";
import authService from "@/features/auth/services/auth.service";
import { ForgotPasswordRequest } from "@/features/auth/services/auth.type";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MdArrowForward, MdOutlineEmail } from "react-icons/md";

function validateEmail(value: string) {
  if (value.trim().length === 0) {
    return "O e-mail é obrigatório";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "Informe um e-mail válido";
  }
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [requestSent, setRequestSent] = useState(false);
  const mutation = useMutation({
    mutationKey: ["auth", "password", "forgot"],
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
    onSuccess: () => setRequestSent(true),
  });

  const form = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: ({ value }) => {
      setRequestSent(false);
      mutation.mutate({ email: value.email.trim() });
    },
  });

  return (
    <ScrollView
      className="flex-1 bg-secondary-min"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-1 justify-center gap-6 p-4">
        <View className="flex flex-col items-center justify-center gap-1">
          <Image
            style={{ width: 79, height: 79 }}
            source={require("@/assets/images/icon.png")}
          />
          <Text className="text-3xl text-secondary-max font-primary-bold">
            Esqueceu sua senha?
          </Text>
          <Text className="text-center font-secondary-regular text-[0.8rem] text-customblack-min">
            Informe seu e-mail e enviaremos um link para criar uma nova senha.
          </Text>
        </View>

        <View className="flex flex-col gap-4 rounded-3xl bg-white px-4 py-5">
          <form.Field
            name="email"
            validators={{
              onBlur: ({ value }) => validateEmail(value),
              onSubmit: ({ value }) => validateEmail(value),
            }}
          >
            {(field) => (
              <View className="flex flex-col gap-2">
                <InputWithLabel
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  leading={<MdOutlineEmail className="size-6 text-customgray" />}
                  label="E-mail"
                  keyboardType="email-address"
                  inputMode="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  placeholder="seuemail@exemplo.com"
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className="font-secondary-regular text-[0.5rem] text-error">
                    {field.state.meta.errors[0]}
                  </Text>
                )}
              </View>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
          >
            {([isSubmitting]) => (
              <TouchableOpacity
                accessibilityRole="button"
                disabled={isSubmitting || mutation.isPending}
                onPress={() => form.handleSubmit()}
                className={`flex min-h-12 flex-row items-center justify-center gap-1 rounded-xl ${
                  isSubmitting || mutation.isPending
                    ? "bg-gray-300"
                    : "bg-primary-min"
                }`}
              >
                {isSubmitting || mutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text className="text-white">Enviar link</Text>
                    <MdArrowForward className="size-4 text-white" />
                  </>
                )}
              </TouchableOpacity>
            )}
          </form.Subscribe>

          <Link
            className="self-center text-primary-max"
            href="/(auth)/sign-in"
          >
            Voltar para o login
          </Link>
        </View>
      </View>

      <ErrorBottomSheet error={mutation.error} />
      <SuccessBottomSheet
        messsage="Enviamos o link para o seu e-mail."
        isOpen={requestSent}
        onDismiss={() => {
          setRequestSent(false);
          router.replace("/(auth)/sign-in");
        }}
      />
    </ScrollView>
  );
}
