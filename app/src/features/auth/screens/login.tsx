import { View, Text, Image, TouchableOpacity } from "react-native";
import InputWithLabel from "../components/input_with_label";
import {
  MdArrowForward,
  MdLockOutline,
  MdOutlineEmail,
  MdOutlineVisibility,
} from "react-icons/md";
import { FaMicrosoft } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";
import { Link, useRouter } from "expo-router";
import authService from "../services/auth.service";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "@/hooks/useSession";
import ErrorBottomSheet from "@/components/ErrorBottomSheet";
import { useState } from "react";
import { AxiosError, isAxiosError } from "axios";
import * as AuthSession from "expo-auth-session";
import { useAutoDiscovery, useAuthRequest } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import useLoginWithMicrosoft from "../hooks/useLoginWithMicrosoft";

WebBrowser.maybeCompleteAuthSession();

async function handleLogin(email: string, password: string) {
  const response = await authService.login({ email, password });

  return response;
}

export default function LoginScreen() {
  const { signIn } = useSession();
  const router = useRouter();
  const microsoft = useLoginWithMicrosoft();

  const mutate = useMutation<
    any,
    AxiosError,
    { email: string; password: string }
  >({
    mutationKey: ["auth", "login"],
    mutationFn: (value: { email: string; password: string }) =>
      handleLogin(value.email, value.password),
    onSuccess: ({ data }) => {
      signIn(data["access_token"]);

      router.replace("/");
    },
  });

  const microsoftMutation = useMutation<any, AxiosError, any>({
    mutationKey: ["auth", "microsoft"],
    mutationFn: async () => {
      const data = await microsoft.handleMicrosoftLogin();

      if (data) {
        const signInData = {
          code: data.code!,
          codeVerifier: data.verifier!,
          redirectUri: process.env.EXPO_PUBLIC_MICROSOFT_REDIRECT_URL!,
        };

        try {
          return await authService.loginWithMicrosoft(signInData);
        } catch (e) {
          if (isAxiosError(e)) {
            const microsftIncompletedData = e.response?.data;

            router.push({
              pathname: "/sign-up",
              params: {
                email: microsftIncompletedData.email as string,
                redirectByMicrosoftLogin: 1,
              },
            });
          }
        }
      }
    },
    onSuccess: ({ data }) => {
      signIn(data["access_token"]);

      router.replace("/");
    },
  });

  const authForm = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onMount: ({ value }) => {
        if (value.email.trim().length == 0) {
          return {
            email: "O e-mail é obrigatório",
          };
        }

        if (value.password.length === 0) {
          return {
            password: "A senha é obrigatória",
          };
        }
      },
    },
    onSubmit: ({ value }) => {
      mutate.mutate({
        email: value.email,
        password: value.password,
      });
    },
  });

  return (
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
          Bem-vindo de volta
        </Text>
        <Text className="font-secondary-regular text-[0.8rem] text-customblack-min">
          Acesse sua conta e continue cuidando de você.
        </Text>
      </View>
      <View className="flex flex-col bg-white gap-4 py-2 rounded-3xl px-4">
        <authForm.Field
          name="email"
          validators={{
            onBlur: ({ value }) => {
              if (value.trim().length == 0) {
                return "O e-mail é obrigatório";
              }
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return "Informe um e-mail válido";
              }
            },
          }}
        >
          {(field) => (
            <View className="flex flex-col gap-2">
              <InputWithLabel
                value={field.state.value}
                onChangeText={(text) => field.handleChange(text)}
                onBlur={field.handleBlur}
                leading={<MdOutlineEmail className="text-customgray size-6" />}
                label="E-mail"
                keyboardType="email-address"
                inputMode="email"
                placeholder="seuemail@exemplo.com"
              />
              {field.state.meta.errors.length > 0 && (
                <Text className="font-secondary-regular text-error text-[0.5rem]">
                  {field.state.meta.errors[0]}
                </Text>
              )}
            </View>
          )}
        </authForm.Field>

        <authForm.Field
          name="password"
          validators={{
            onBlur: ({ value }) => {
              value = value.trim();
              if (value.length === 0) {
                return "A senha é obrigatória";
              }

              if (value.length < 8) {
                return "A senha deve ter no mínimo 8 caracteres";
              }
            },
          }}
        >
          {(field) => (
            <View className="flex flex-col gap-2">
              <InputWithLabel
                value={field.state.value}
                onChangeText={(text) => field.handleChange(text)}
                onBlur={field.handleBlur}
                leading={<MdLockOutline className="text-customgray size-6" />}
                label="Senha"
                secureTextEntry={true}
                trailing={
                  <MdOutlineVisibility className="text-customgray size-6" />
                }
              />

              {field.state.meta.errors.length > 0 && (
                <Text className="font-secondary-regular text-error text-[0.5rem]">
                  {field.state.meta.errors[0]}
                </Text>
              )}
            </View>
          )}
        </authForm.Field>

        <View className="flex flex-row items-end justify-end">
          <Link className="text-primary-max" href="/">
            Esqueci minha senha
          </Link>
        </View>

        <authForm.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <TouchableOpacity
              disabled={!canSubmit || isSubmitting}
              onPress={() => {
                authForm.handleSubmit();
              }}
              className={`min-h-12 flex flex-row items-center justify-center ${canSubmit && !isSubmitting ? "bg-primary-min" : "bg-gray-300"} gap-0.5 rounded-xl`}
            >
              {!isSubmitting ? (
                <>
                  <Text className="text-white">Entrar</Text>

                  <MdArrowForward className="text-white size-4" />
                </>
              ) : (
                <CgSpinner className="text-white size-4 animate-spin" />
              )}
            </TouchableOpacity>
          )}
        </authForm.Subscribe>

        <View className="flex flex-row items-center justify-center">
          <View className="h-0.5 w-20 bg-gray-300" />
          <Text className="px-2 text-customgray">ou continue com</Text>
          <View className="h-0.5 w-20 bg-gray-300" />
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Continuar com Microsoft"
          disabled={microsoft.isSubmitting || microsoftMutation.isPending}
          onPress={async () => {
            microsoftMutation.mutate();
          }}
          className="min-h-12 flex flex-row items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white"
        >
          {microsoft.isSubmitting || microsoftMutation.isPending ? (
            <CgSpinner className="text-customgray size-4 animate-spin" />
          ) : (
            <FaMicrosoft color="#F25022" size={18} />
          )}
          <Text className="font-secondary-medium text-customblack-min">
            Continuar com Microsoft
          </Text>
        </TouchableOpacity>
      </View>
      <View className="flex flex-col items-center justify-center">
        <Text className="font-secondary-regular text-sm text-gray-600">
          Ainda não tem uma conta?{" "}
          <Link
            href="/(auth)/sign-up"
            className="text-primary-max font-secondary-bold text-[1rem]"
          >
            Cadastre-se
          </Link>
        </Text>
      </View>
      <View className="flex flex-row items-center justify-center gap-4">
        <Text className="text-customblack-min">Privacidade</Text>
        <Text className="text-customblack-min">•</Text>
        <Text className="text-customblack-min">Termos</Text>
        <Text className="text-customblack-min">•</Text>
        <Text className="text-customblack-min">Ajuda</Text>
      </View>

      <ErrorBottomSheet error={microsoftMutation.error ?? mutate.error} />
    </View>
  );
}
