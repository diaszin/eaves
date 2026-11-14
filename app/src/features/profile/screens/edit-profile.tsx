import authService from "@/features/auth/services/auth.service";
import { ProfileResponse } from "@/features/auth/services/auth.type";
import InputWithLabel from "@/features/auth/components/input_with_label";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Stack, useRouter } from "expo-router";
import {
  ActivityIndicator,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import DropdownWithLabel from "@/features/auth/components/dropdown_with_label";
import ErrorBottomSheet from "@/components/ErrorBottomSheet";
import SuccessBottomSheet from "@/components/SuccesssBottomSheet";
import { UpdateUserRequest } from "@/features/auth/services/auth.type";
import { Masks } from "react-native-mask-input";
import MaskInputWithLabel from "@/features/auth/components/masked_input_with_label";
import { useState } from "react";

export default function ProfileEditScreen() {
  const profileQuery = useQuery<ProfileResponse, AxiosError>({
    queryKey: ["user", "profile"],
    queryFn: () => authService.getProfile(),
  });

  if (profileQuery.isPending) {
    return (
      <View>
        <Stack.Screen options={{ title: "Alterar Dados", headerShown: true }} />
        <Text>Carregando perfil...</Text>
      </View>
    );
  }

  if (profileQuery.isError) {
    return (
      <View>
        <Stack.Screen options={{ title: "Alterar Dados", headerShown: true }} />
        <Text>Não foi possível carregar os dados do perfil.</Text>
        <ErrorBottomSheet error={profileQuery.error} />
      </View>
    );
  }

  return <ProfileEditForm profile={profileQuery.data} />;
}

function ProfileEditForm({ profile }: { profile: ProfileResponse }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profileUpdated, setProfileUpdated] = useState(false);
  const updateMutation = useMutation({
    mutationKey: ["user", "profile", "update"],
    mutationFn: (data: UpdateUserRequest) => authService.update(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
      setProfileUpdated(true);
    },
  });
  const cepMask = Masks.ZIP_CODE;
  const phoneMask = Masks.BRL_PHONE;

  const form = useForm({
    defaultValues: {
      email: profile.email,
      role: profile.role,
      fullname: profile.profile.fullname,
      birthDate: profile.profile.birthDate,
      incomeBraket: profile.profile.incomeBraket,
      emergencyPhone: profile.profile.emergencyPhone,
      cep: profile.profile.cep,
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        email: value.email,
        fullname: value.fullname,
        birthDate: value.birthDate,
        incomeBraket: value.incomeBraket,
        emergencyPhone: value.emergencyPhone,
        cep: value.cep,
      });
    },
  });

  const incomeBraketOptions = [
    {
      label: "Até 2 salários mínimos ",
      value: "ate-2-salarios-minimos",
    },
    {
      label: "de 2 a 5 salários mínimos",
      value: "de-2-a-5-salarios-minimos",
    },
    {
      label: "Mais de 5 salários mínimos",
      value: "mais-de-5",
    },
    {
      label: "Mais de 10 salários mínimos",
      value: "mais-de-10",
    },
    {
      label: "Mais de 10 a 20 salários mínimos",
      value: "mais-de-10-a-20",
    },
    {
      label: "Mais de 20 salários mínimos",
      value: "mais-de-20",
    },
    {
      label: "Sem rendimento",
      value: "sem-rendimento",
    },
  ];

  return (
    <ScrollView className="w-full">
      <Stack.Screen
        options={{
          title: "Alterar Dados",
          headerShown: true,
        }}
      />
      <View className="flex flex-col items-center justify-center w-full">
        <Image
          style={{
            width: 79,
            height: 79,
          }}
          source={require("@/assets/images/icon.png")}
        />
        <Text className="text-3xl text-secondary-max font-primary-bold">
          Altere seus dados
        </Text>

        <View className="p-6 gap-4 w-full">
          <form.Field name="email">
            {(field) => (
              <InputWithLabel
                label="E-mail"
                value={String(field.state.value ?? "")}
                className="w-full"
                onChangeText={field.handleChange}
                keyboardType="email-address"
              />
            )}
          </form.Field>
          <form.Field name="fullname">
            {(field) => (
              <InputWithLabel
                label="Nome completo"
                className="w-full"
                value={String(field.state.value ?? "")}
                onChangeText={field.handleChange}
              />
            )}
          </form.Field>
          <form.Field name="emergencyPhone">
            {(field) => (
              <MaskInputWithLabel
                label="Telefone de emergência"
                value={field.state.value}
                onChangeText={field.handleChange}
                keyboardType="phone-pad"
                placeholder="(00) 11234-1234"
                inputMode="numeric"
                mask={phoneMask}
              />
            )}
          </form.Field>
          <form.Field name="cep">
            {(field) => (
              <MaskInputWithLabel
                defaultValue={undefined}
                value={field.state.value}
                onChangeText={(_, value) => field.handleChange(value)}
                onBlur={field.handleBlur}
                label="CEP"
                placeholder="XXXXX-XXX"
                inputMode="numeric"
                mask={cepMask}
              />
            )}
          </form.Field>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => {
              const isBusy = isSubmitting || updateMutation.isPending;

              return (
                <TouchableOpacity
                  className={`w-full h-10 rounded-sm flex items-center justify-center ${isBusy ? "bg-gray-300" : "bg-primary-max"}`}
                  onPress={() => form.handleSubmit()}
                  disabled={isBusy}
                >
                  {isBusy ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-primary-bold">Salvar</Text>
                  )}
                </TouchableOpacity>
              );
            }}
          </form.Subscribe>
        </View>
      </View>
      <ErrorBottomSheet error={updateMutation.error} />
      <SuccessBottomSheet
        messsage="Dados alterados"
        isOpen={profileUpdated}
        onDismiss={() => {
          setProfileUpdated(false);
          router.back();
        }}
      />
    </ScrollView>
  );
}
