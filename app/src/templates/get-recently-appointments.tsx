import appointmentService from "@/features/appointments/services/appointment.service";
import { useQuery } from "@tanstack/react-query";
import { View, Text } from "react-native";

export default function GetRecentlyAppointments() {
  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "view"],
    queryFn: appointmentService.get,
  });

  if (!appointmentsQuery.data) {
    return (
      <View>
        <Text>Nenhum agendamento</Text>
      </View>
    );
  }

  const isToday =
    appointmentsQuery.data.initialDate.toDateString() ==
    new Date().toDateString();

  const weekday = appointmentsQuery.data.initialDate
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "");
  const month = appointmentsQuery.data.initialDate
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
  const formattedDate = `${weekday[0].toUpperCase()}${weekday.slice(1)}, ${appointmentsQuery.data.initialDate.getDate()} ${month[0].toUpperCase()}${month.slice(1)}`;

  return (
    <View>
      <View>
        <View></View>
        <View className="flex flex-row bg-blue-300 ">
          <Text className="text-blue-500">
            {isToday ? "Hoje" : formattedDate}
          </Text>
        </View>
      </View>
    </View>
  );
}
