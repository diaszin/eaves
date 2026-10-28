import { useQuery } from "@tanstack/react-query";
import { Stack, useLocalSearchParams } from "expo-router";
import { View, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import personalJournalService from "../services/personal-journal.service";

export default function PersonalJournalView() {
  const { id } = useLocalSearchParams();

  const getJournalQuery = useQuery({
    queryKey: ["personal-journal", { id }],
    queryFn: () => personalJournalService.getById(+id),
  });

  if (!getJournalQuery.data) {
    return null;
  }

  const convertedDate = new Date(Date.parse(getJournalQuery.data.createdDate));
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Bahia",
    dateStyle: "long",
  });
  const formattedPublishDate = dateFormatter.format(convertedDate);

  return (
    <SafeAreaView className="m-4 h-full flex flex-col gap-4">
      <Stack.Screen
        options={{
          title: formattedPublishDate,
          headerShown: true,
        }}
      />
      <View className="flex flex-col gap-1">
        <Text className="font-secondary-semibold text-secondary-max">
          {formattedPublishDate}
        </Text>
        <Text className="font-primary-bold text-customblack-max text-[1.4rem]">
          Seu desabafo está seguro aqui
        </Text>
      </View>
      
        
        <TextInput
          value={getJournalQuery.data.content}
          editable={false}
          selectTextOnFocus={false}
          placeholder="Escreva sem filtros nem regras. Solte seus pensamentos, conte sobre o seu dia ou simplesmente desabafe o que está aí dentro..."
          multiline
          autoFocus
          style={{
            fontSize: 15,
          }}
          className="p-2 mt-8 h-full outline-none rounded-md shadow bg-white h- placeholder:text-[1.5rem] placeholder:font-secondary-semibold"
        />
      
    </SafeAreaView>
  );
}
