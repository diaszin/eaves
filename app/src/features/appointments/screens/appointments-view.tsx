import employeesService from "@/features/employees/services/employees.service";
import { useQuery } from "@tanstack/react-query";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import EmployeesCard from "../components/employees-card";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef } from "react";

export default function AppointmentsView() {
  const router = useRouter();
  const isNavigating = useRef(false);

  // Libera novos toques quando a tela volta ao foco (evita telas duplicadas).
  useFocusEffect(
    useCallback(() => {
      isNavigating.current = false;
    }, []),
  );
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
            onPress={() => {
              if (isNavigating.current) return;
              isNavigating.current = true;
              router.push({
                pathname: "/(app)/(authenticated)/appointments/create",
                params: {
                  id: item.id,
                  fullname: item.profile.fullname,
                },
              });
            }}
          />
        )}
      />
    </SafeAreaView>
  );
}
