import PressableScale from "@/shared/components/pressable-scale";
import appointmentService from "@/features/appointments/services/appointment.service";
import type { Appointment } from "@/features/appointments/services/appointment.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MdNaturePeople } from "react-icons/md";
import { View, Text, FlatList } from "react-native";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendado",
  cancelled: "Cancelado",
};

function getErrorMessage(error: unknown): string {
  const message = (
    error as { response?: { data?: { message?: string | string[] } } }
  )?.response?.data?.message;

  if (Array.isArray(message)) return message.join(" ");

  return (
    message ?? "Não foi possível cancelar o agendamento. Tente novamente."
  );
}

function AppointmentItem({ item }: { item: Appointment }) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const cancelMutation = useMutation({
    mutationKey: ["appointments", "cancel", item.id],
    mutationFn: () => appointmentService.cancel(item.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setConfirming(false);
    },
  });

  const initialDate = new Date(item.initialDate);
  const endDate = new Date(item.endDate);

  const status = item.status ?? "scheduled";
  const isCancelled = status === "cancelled";
  const hasEnded = endDate.getTime() <= Date.now();
  const canCancel = !isCancelled && !hasEnded;

  const isToday = initialDate.toDateString() === new Date().toDateString();

  const weekday = initialDate
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "");
  const month = initialDate
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
  const formattedDate = `${weekday[0].toUpperCase()}${weekday.slice(1)}, ${initialDate.getDate()} ${month[0].toUpperCase()}${month.slice(1)}`;

  const initialDateHour = `${String(initialDate.getHours()).padStart(2, "0")}:${String(initialDate.getMinutes()).padStart(2, "0")}`;

  const endDateHour = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;

  return (
    <View className="bg-white flex flex-col gap-2 p-2">
      <View className="flex flex-row items-center gap-2">
        <View className="bg-blue-100 flex items-center justify-center size-10 rounded-full">
          <MdNaturePeople className="text-primary-max" size={25} />
        </View>
        <View className="flex flex-col gap-1 flex-1">
          <Text className={isCancelled ? "line-through text-gray-500" : ""}>
            {item.professional.profile.fullname}
          </Text>
          <View className="flex flex-row bg-blue-100 rounded-md p-1 self-start">
            <Text className="font-secondary-medium text-primary-max text-[0.7rem]">
              {isToday ? "Hoje" : formattedDate} • {initialDateHour} às{" "}
              {endDateHour}
            </Text>
          </View>
        </View>
        <View
          className={
            isCancelled
              ? "bg-red-100 rounded-md px-2 py-1"
              : "bg-green-100 rounded-md px-2 py-1"
          }
        >
          <Text
            className={
              isCancelled
                ? "text-red-700 text-[0.7rem]"
                : "text-green-700 text-[0.7rem]"
            }
          >
            {STATUS_LABELS[status] ?? status}
          </Text>
        </View>
      </View>

      {canCancel &&
        (confirming ? (
          <View className="flex flex-col gap-2 bg-red-50 rounded-md p-2">
            <Text className="text-red-700 text-[0.8rem]">
              Tem certeza que deseja cancelar este agendamento? Essa ação não
              pode ser desfeita.
            </Text>
            <View className="flex flex-row gap-2">
              <PressableScale
                accessibilityRole="button"
                disabled={cancelMutation.isPending}
                onPress={() => cancelMutation.mutate()}
                className="bg-red-600 rounded-md px-3 py-2"
              >
                <Text className="text-white text-[0.8rem]">
                  {cancelMutation.isPending
                    ? "Cancelando..."
                    : "Confirmar cancelamento"}
                </Text>
              </PressableScale>
              <PressableScale
                accessibilityRole="button"
                disabled={cancelMutation.isPending}
                onPress={() => {
                  cancelMutation.reset();
                  setConfirming(false);
                }}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <Text className="text-[0.8rem]">Voltar</Text>
              </PressableScale>
            </View>
            {cancelMutation.isError && (
              <Text className="text-red-700 text-[0.8rem]">
                {getErrorMessage(cancelMutation.error)}
              </Text>
            )}
          </View>
        ) : (
          <PressableScale
            accessibilityRole="button"
            onPress={() => setConfirming(true)}
            className="self-start border border-red-600 rounded-md px-3 py-2"
          >
            <Text className="text-red-600 text-[0.8rem]">Cancelar</Text>
          </PressableScale>
        ))}
    </View>
  );
}

export default function GetRecentlyAppointments() {
  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "view"],
    queryFn: () => appointmentService.get(),
  });

  if (appointmentsQuery.isLoading) {
    return null;
  }

  if (!appointmentsQuery.data) {
    return (
      <View>
        <Text>Nenhum agendamento</Text>
      </View>
    );
  }

  return (
    <View className="flex flex-col gap-2">
      <Text className="font-primary-bold text-[1.2rem]">Seus agendamentos</Text>
      <FlatList
        data={appointmentsQuery.data}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="flex flex-col gap-2"
        renderItem={({ item }) => <AppointmentItem item={item} />}
      />
    </View>
  );
}
