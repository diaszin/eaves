import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  Text,
  ScrollView,
  FlatList,
  Pressable,
  ActivityIndicator,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmployeesCard from "../components/employees-card";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import appointmentService from "../services/appointment.service";
import HourBadge from "../components/hour-badge";
import { useForm } from "@tanstack/react-form";
import authService from "@/features/auth/services/auth.service";
import ErrorBottomSheet from "@/components/ErrorBottomSheet";
import SuccessBottomSheet from "@/components/SuccesssBottomSheet";
import type { CreateAppointmentRequest } from "../services/appointment.type";
import { runWithViewTransition } from "@/shared/navigation/view-transition";
import { MdArrowBack } from "react-icons/md";
export default function AppointmentsCreate() {
  const query = useQueryClient();
  const [visibleDateCount, setVisibleDateCount] = useState(5);
  const { id, fullname } = useLocalSearchParams<{
    id: string;
    fullname: string;
  }>();

  const profileQuery = useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => authService.getProfile(),
  });

  const professionalScheduleMutation = useMutation({
    mutationKey: ["professional-schedule", +id],
    mutationFn: ({ date }: { date: Date }) =>
      appointmentService.getCalendar(+id, date),
  });

  const createAppointmentMutation = useMutation({
    mutationKey: ["appointments", "create"],
    mutationFn: (data: CreateAppointmentRequest) =>
      appointmentService.create(data),
    onSuccess: () => {
      query.invalidateQueries({
        queryKey: ["appointments"],
      });
    },
  });

  const form = useForm({
    defaultValues: {
      date: new Date(),
      selectedHour: "",
    },
    onSubmit: async ({ value }) => {
      const [hours, minutes] = value.selectedHour.split(":").map(Number);
      const initialDate = new Date(value.date);
      initialDate.setHours(hours, minutes, 0, 0);

      await createAppointmentMutation.mutateAsync({
        initialDate: initialDate.toISOString(),
        professionalId: +id,
      });
    },
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: "Agendar consulta",
          headerShown: true,
          // Web: voltar dentro de uma view transition (Hero); móvel usa o botão nativo.
          headerLeft:
            Platform.OS === "web"
              ? () => (
                  <TouchableOpacity
                    accessibilityLabel="Voltar"
                    onPress={() =>
                      runWithViewTransition(() => router.back(), {
                        professionalId: +id,
                      })
                    }
                    style={{ paddingHorizontal: 12 }}
                  >
                    <MdArrowBack size={24} />
                  </TouchableOpacity>
                )
              : undefined,
        }}
      />
      <ScrollView className="flex flex-col m-2 px-3 h-full">
        <EmployeesCard id={+id} fullname={fullname} />
        <View className="flex flex-col gap-3">
          <Text className="my-3 font-semibold">Escolha uma data</Text>
          <form.Field name="date">
            {(field) => (
              <FlatList
                horizontal
                data={Array.from({ length: visibleDateCount }, (_, index) => {
                  const option = new Date();
                  option.setHours(0, 0, 0, 0);
                  option.setDate(option.getDate() + index);
                  return option;
                })}
                keyExtractor={(item) => item.toISOString()}
                showsHorizontalScrollIndicator={false}
                onEndReached={() => setVisibleDateCount((count) => count + 5)}
                onEndReachedThreshold={0.5}
                contentContainerStyle={{ gap: 8 }}
                renderItem={({ item }) => {
                  const selected =
                    item.toDateString() === field.state.value.toDateString();
                  const dayoFWeek = item.toLocaleDateString("pt-BR", {
                    weekday: "short",
                  });
                  const dayOFWeekInTitleCase =
                    dayoFWeek.charAt(0).toUpperCase() +
                    dayoFWeek.slice(1).toLowerCase();
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Selecionar ${dayOFWeekInTitleCase}, ${item.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`}
                      disabled={professionalScheduleMutation.isPending}
                      onPress={() => {
                        field.handleChange(item);
                        form.setFieldValue("selectedHour", "");
                        professionalScheduleMutation.mutate({ date: item });
                      }}
                      className={`items-center justify-center rounded-lg h-16 w-24 border px-3 py-2 ${
                        selected
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {professionalScheduleMutation.isPending &&
                      professionalScheduleMutation.variables?.date.toDateString() ===
                        item.toDateString() ? (
                        <ActivityIndicator
                          size="small"
                          color={selected ? "#FFFFFF" : "#2563EB"}
                        />
                      ) : (
                        <>
                          <Text
                            className={selected ? "text-white" : "text-gray-800"}
                          >
                            {dayOFWeekInTitleCase}
                          </Text>
                          <Text
                            className={
                              selected
                                ? "font-bold text-white"
                                : "font-bold text-gray-800"
                            }
                          >
                            {item.toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </Text>
                        </>
                      )}
                    </Pressable>
                  );
                }}
              />
            )}
          </form.Field>
          {professionalScheduleMutation.isPending && (
            <ActivityIndicator className="my-4" />
          )}
          <form.Field
            name="selectedHour"
            validators={{
              onChange({ value }) {
                if (!value) {
                  return "Escolha um horário para continuar";
                }
              },
              onSubmit({ value }) {
                if (!value) {
                  return "Escolha um horário para continuar";
                }
              },
            }}
          >
            {(field) => (
              <View>
                <FlatList
                  key="appointments-hours"
                  data={professionalScheduleMutation.data ?? []}
                  numColumns={2}
                  columnWrapperStyle={{
                    justifyContent: "center",
                    gap: 8,
                  }}
                  contentContainerStyle={{
                    rowGap: 12,
                  }}
                  scrollEnabled={false}
                  keyExtractor={(_, index) => String(index)}
                  renderItem={({ item }) => {
                    const selected = item.startTime === field.state.value;

                    return (
                      <HourBadge
                        isSelected={selected}
                        onPress={() =>
                          field.handleChange(selected ? "" : item.startTime)
                        }
                        startTime={item.startTime}
                        endTime={item.endTime}
                      />
                    );
                  }}
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className="mt-2 text-sm text-error">
                    {field.state.meta.errors[0]}
                  </Text>
                )}
              </View>
            )}
          </form.Field>
        </View>
      </ScrollView>
      <View className="p-5 w-full">
        <form.Subscribe
          selector={(state) => ({
            date: state.values.date,
            selectedHour: state.values.selectedHour,
          })}
        >
          {({ date, selectedHour }) => {
            const weekday = date
              .toLocaleDateString("pt-BR", { weekday: "short" })
              .replace(".", "");
            const month = date
              .toLocaleDateString("pt-BR", { month: "short" })
              .replace(".", "");
            const formattedDate = `${weekday[0].toUpperCase()}${weekday.slice(1)}, ${date.getDate()} ${month[0].toUpperCase()}${month.slice(1)}`;

            if (!selectedHour) {
              return null;
            }

            return (
              <View className="flex flex-col items-start gap-y-1 mb-3">
                <Text className="font-secondary-regular text-gray-700">
                  Sessão selecionada
                </Text>
                <Text className="font-secondary-bold text-gray-900">
                  {formattedDate} • {selectedHour}
                </Text>
              </View>
            );
          }}
        </form.Subscribe>
        <View className="w-full">
          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => {
              const isDisabled =
                !canSubmit ||
                isSubmitting ||
                createAppointmentMutation.isPending ||
                profileQuery.isPending ||
                profileQuery.isError;

              return (
                <TouchableOpacity
                  disabled={isDisabled}
                  onPress={() => form.handleSubmit()}
                  className={`rounded-lg w-full h-12 flex items-center justify-center ${
                    isDisabled ? "bg-gray-300" : "bg-primary-min"
                  }`}
                >
                  {isSubmitting || createAppointmentMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-[1.2rem] font-primary-medium">
                      Confirmar agendamento
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }}
          </form.Subscribe>
        </View>
      </View>
      {profileQuery.isError && <ErrorBottomSheet error={profileQuery.error} />}
      {createAppointmentMutation.isError && (
        <ErrorBottomSheet error={createAppointmentMutation.error} />
      )}
      {createAppointmentMutation.isSuccess && (
        <SuccessBottomSheet
          isOpen
          messsage="Agendamento confirmado"
          onDismiss={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(app)/(authenticated)/(home)/appointments");
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}
