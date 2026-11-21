import PressableScale from "@/shared/components/pressable-scale";
import ErrorBottomSheet from "@/components/ErrorBottomSheet";
import SuccessBottomSheet from "@/components/SuccesssBottomSheet";
import InputWithLabel from "@/features/auth/components/input_with_label";
import authService from "@/features/auth/services/auth.service";
import { ResetPasswordRequest } from "@/features/auth/services/auth.type";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { MdArrowForward, MdLockOutline } from "react-icons/md";

function validatePassword(value: string) {
  if (value.length === 0) {
    return "A senha é obrigatória";
  }
  if (value.length < 8) {
    return "A senha deve ter no mínimo 8 caracteres";
  }
}

export default function ResetPasswordScreen() {
  const { token: tokenParam } = useLocalSearchParams<{
    token?: string | string[];
  }>();
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
  const router = useRouter();
  const [passwordChanged, setPasswordChanged] = useState(false);
  const mutation = useMutation({
    mutationKey: ["auth", "password", "reset"],
    mutationFn: (data: ResetPasswordRequest) =>
      authService.resetPassword(data),
    onSuccess: () => setPasswordChanged(true),
  });

  const form = useForm({
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
    onSubmit: ({ value }) => {
      if (!token) {
        return;
      }
      mutation.mutate({ token, password: value.password });
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
            Crie uma nova senha
          </Text>
          <Text className="text-center font-secondary-regular text-[0.8rem] text-customblack-min">
            Escolha uma senha com pelo menos 8 caracteres.
          </Text>
        </View>

        {!token ? (
          <View className="items-center gap-4 rounded-3xl bg-white px-4 py-6">
            <Text className="text-center font-secondary-regular text-customblack-min">
              Este link de redefinição é inválido ou está incompleto.
            </Text>
            <Link
              className="text-primary-max"
              href="/(auth)/forgot-password"
            >
              Solicitar outro link
            </Link>
          </View>
        ) : (
          <View className="flex flex-col gap-4 rounded-3xl bg-white px-4 py-5">
            <form.Field
              name="password"
              validators={{
                onBlur: ({ value }) => validatePassword(value),
                onSubmit: ({ value }) => validatePassword(value),
              }}
            >
              {(field) => (
                <View className="flex flex-col gap-2">
                  <InputWithLabel
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    leading={<MdLockOutline className="size-6 text-customgray" />}
                    label="Nova senha"
                    secureTextEntry
                    autoComplete="new-password"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <Text className="font-secondary-regular text-[0.5rem] text-error">
                      {field.state.meta.errors[0]}
                    </Text>
                  )}
                </View>
              )}
            </form.Field>

            <form.Field
              name="passwordConfirmation"
              validators={{
                onBlur: ({ value }) => {
                  if (value.length === 0) {
                    return "Confirme sua senha";
                  }
                  if (value !== form.getFieldValue("password")) {
                    return "As senhas não coincidem";
                  }
                },
                onSubmit: ({ value }) => {
                  if (value.length === 0) {
                    return "Confirme sua senha";
                  }
                  if (value !== form.getFieldValue("password")) {
                    return "As senhas não coincidem";
                  }
                },
              }}
            >
              {(field) => (
                <View className="flex flex-col gap-2">
                  <InputWithLabel
                    value={field.state.value}
                    onChangeText={field.handleChange}
                    onBlur={field.handleBlur}
                    leading={<MdLockOutline className="size-6 text-customgray" />}
                    label="Confirme a nova senha"
                    secureTextEntry
                    autoComplete="new-password"
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
                <PressableScale
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
                      <Text className="text-white">Redefinir senha</Text>
                      <MdArrowForward className="size-4 text-white" />
                    </>
                  )}
                </PressableScale>
              )}
            </form.Subscribe>
          </View>
        )}

        <Link
          className="self-center text-primary-max"
          href="/(auth)/sign-in"
        >
          Voltar para o login
        </Link>
      </View>

      <ErrorBottomSheet error={mutation.error} />
      <SuccessBottomSheet
        messsage="Sua senha foi redefinida com sucesso."
        isOpen={passwordChanged}
        onDismiss={() => {
          setPasswordChanged(false);
          router.replace("/(auth)/sign-in");
        }}
      />
    </ScrollView>
  );
}
