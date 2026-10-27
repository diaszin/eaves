import ErrorBottomSheet from "@/components/ErrorBottomSheet";
import SuccessBottomSheet from "@/components/SuccesssBottomSheet";
import InputWithLabel from "@/features/auth/components/input_with_label";
import authService from "@/features/auth/services/auth.service";
import { ChangePasswordRequest } from "@/features/auth/services/auth.type";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

function validatePassword(value: string, label: string) {
  if (!value || value.length === 0) {
    return `${label} é obrigatória`;
  }
  if (value.length < 8) {
    return "A senha deve ter no mínimo 8 caracteres";
  }
}

function validateOldPasswordConfirmation(value: string, oldPassword: string) {
  if (!value || value.length === 0) {
    return "Confirme a senha antiga";
  }
  if (value !== oldPassword) {
    return "As senhas antigas não coincidem";
  }
}

export default function ProfileChangePasswordScreen() {
  const router = useRouter();
  const [passwordChanged, setPasswordChanged] = useState(false);
  const changePasswordMutation = useMutation({
    mutationKey: ["user", "profile", "change-password"],
    mutationFn: (data: ChangePasswordRequest) =>
      authService.changePassword(data),
    onSuccess: () => setPasswordChanged(true),
  });

  const form = useForm({
    defaultValues: {} as {
      oldPassword: string;
      oldPasswordConfirmation: string;
      newPassword: string;
    },
    onSubmit: async ({ value }) => {
      setPasswordChanged(false);
      await changePasswordMutation.mutateAsync({
        oldPassword: value.oldPassword,
        newPassword: value.newPassword,
      });
    },
  });

  return (
    <ScrollView className="w-full">
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Mudar minha senha",
        }}
      />
      <View className="flex flex-col items-center justify-center w-full">
        <Image
          style={{ width: 79, height: 79 }}
          source={require("@/assets/images/icon.png")}
        />
        <Text className="text-3xl text-secondary-max font-primary-bold">
          Altere sua senha
        </Text>

        <View className="p-6 gap-4 w-full">
          <form.Field
            name="oldPassword"
            validators={{
              onBlur: ({ value }) => validatePassword(value, "A senha antiga"),
              onSubmit: ({ value }) =>
                validatePassword(value, "A senha antiga"),
            }}
          >
            {(field) => (
              <View className="flex flex-col gap-2">
                <InputWithLabel
                  label="Senha antiga"
                  className="w-full"
                  defaultValue={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  secureTextEntry
                  keyboardType="visible-password"
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className="font-secondary-regular text-error text-[0.5rem]">
                    {field.state.meta.errors[0]}
                  </Text>
                )}
              </View>
            )}
          </form.Field>

          <form.Field
            name="oldPasswordConfirmation"
            validators={{
              onBlur: ({ value }) =>
                validateOldPasswordConfirmation(
                  value,
                  form.getFieldValue("oldPassword"),
                ),
              onSubmit: ({ value }) =>
                validateOldPasswordConfirmation(
                  value,
                  form.getFieldValue("oldPassword"),
                ),
            }}
          >
            {(field) => (
              <View className="flex flex-col gap-2">
                <InputWithLabel
                  label="Confirme a senha antiga"
                  className="w-full"
                  defaultValue={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  secureTextEntry
                  keyboardType="visible-password"
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className="font-secondary-regular text-error text-[0.5rem]">
                    {field.state.meta.errors[0]}
                  </Text>
                )}
              </View>
            )}
          </form.Field>

          <form.Field
            name="newPassword"
            validators={{
              onBlur: ({ value }) => validatePassword(value, "A nova senha"),
              onSubmit: ({ value }) => validatePassword(value, "A nova senha"),
            }}
          >
            {(field) => (
              <View className="flex flex-col gap-2">
                <InputWithLabel
                  label="Nova senha"
                  className="w-full"
                  defaultValue={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  secureTextEntry
                  keyboardType="visible-password"
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className="font-secondary-regular text-error text-[0.5rem]">
                    {field.state.meta.errors[0]}
                  </Text>
                )}
              </View>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <TouchableOpacity
                className={`w-full h-10 rounded-sm flex items-center justify-center ${
                  canSubmit && !isSubmitting ? "bg-primary-max" : "bg-gray-300"
                }`}
                onPress={() => form.handleSubmit()}
                disabled={
                  !canSubmit || isSubmitting || changePasswordMutation.isPending
                }
              >
                <Text className="text-white font-primary-bold">
                  {changePasswordMutation.isPending
                    ? "Salvando..."
                    : "Alterar senha"}
                </Text>
              </TouchableOpacity>
            )}
          </form.Subscribe>
        </View>
      </View>
      <ErrorBottomSheet error={changePasswordMutation.error} />
      <SuccessBottomSheet
        messsage="Senha alterada com sucesso !"
        isOpen={passwordChanged}
        onDismiss={() => {
          setPasswordChanged(false);
          router.back();
        }}
      />
    </ScrollView>
  );
}
