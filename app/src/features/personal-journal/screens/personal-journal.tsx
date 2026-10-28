import PersonalJournalCreateCard from "@/templates/personal-journal-create-card";
import { useQuery } from "@tanstack/react-query";
import { View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import personalJournalService from "../services/personal-journal.service";
import PersonalJournalCard from "../components/personal-journal-card";
import { useRouter } from "expo-router";
export default function PersonalJournalScreen() {
  const router = useRouter();

  const getAllJournalsQuery = useQuery({
    queryKey: ["personal-journal", "view"],
    queryFn: () => personalJournalService.getAll(),
  });

  return (
    <SafeAreaView className="mx-4 flex-1">
      <PersonalJournalCreateCard />

      <FlatList
        scrollEnabled
        showsVerticalScrollIndicator={false}
        className="flex-1 h-full mt-4"
        data={getAllJournalsQuery.data ?? []}
        renderItem={({ item }) => (
          <PersonalJournalCard
            emotion={item.emotion.emotion}
            publishDate={item.createdDate}
            onPress={() => {
              router.push({
                pathname: "/(app)/(authenticated)/journal/[id]",
                params: {
                  id: item.id,
                },
              });
            }}
          />
        )}
        ItemSeparatorComponent={<View className="h-2" />}
      />
    </SafeAreaView>
  );
}
