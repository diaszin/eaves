import employeesService from "@/features/employees/services/employees.service";
import { useQuery } from "@tanstack/react-query";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmployeesCard from "../components/employees-card";
import { useRouter } from "expo-router";

export default function AppointmentsView() {
  const router = useRouter();
  const employeesQuery = useQuery({
    queryKey: ["employees", "professionals"],
    queryFn: () => employeesService.getTrainers(),
  });

  if (employeesQuery.isLoading) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{ padding: 16, gap: 16 }}
        data={employeesQuery.data}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={({ item }) => (
          <EmployeesCard
            id={item.id}
            fullname={item.profile.fullname}
            onPress={() =>
              router.push({
                pathname: "/(app)/(authenticated)/appointments/create",
                params: {
                  id: item.id,
                  fullname: item.profile.fullname,
                },
              })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}
