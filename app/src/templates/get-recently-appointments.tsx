import appointmentService from "@/features/appointments/services/appointment.service";
import { useQuery } from "@tanstack/react-query";
import { MdNaturePeople } from "react-icons/md";
import { View, Text, FlatList } from "react-native";

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
        contentContainerClassName="flex flex-col gap-2"
        renderItem={({ item }) => {
          const initialDate = new Date(item.initialDate);
          const endDate = new Date(item.endDate);

          const isToday =
            initialDate.toDateString() === new Date().toDateString();

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
              <View className="flex flex-row">
                <View></View>
              </View>
              <View className="flex flex-row items-center gap-2">
                <View className="bg-blue-100 flex items-center justify-center size-10 rounded-full">
                  <MdNaturePeople className="text-primary-max" size={25} />
                </View>
                <View className="flex flex-col gap-1">
                  <Text>{item.professional.profile.fullname}</Text>
                  <View className="flex flex-row bg-blue-100 rounded-md p-1">
                    <Text className="font-secondary-medium text-primary-max text-[0.7rem]">
                      {isToday ? "Hoje" : formattedDate} • {initialDateHour} às{" "}
                      {endDateHour}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
