import { useQuery } from "@tanstack/react-query";
import { View, Text, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import personalJournalService from "../services/personal-journal.service";
import EmotionButton from "../components/emotion-button";
import { useState } from "react";
export default function PersonalJournalCreate() {
  const currentDate = new Date();
  const currentDateFormat = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    timeZone: "America/Bahia",
    day: "2-digit",
  });

  const namedCurrentDate = currentDateFormat.format(currentDate);

  const [selectedEmotion, setEmotion] = useState<number>();
  const getEmotionsQuery = useQuery({
    queryKey: ["emotions", "category"],
    queryFn: () => personalJournalService.getEmotions(),
  });

  return (
    <SafeAreaView>
      <View>
        <Text>Hoje, {namedCurrentDate}</Text>
        <Text>Esse aqui é o seu espaço seguro</Text>
        <Text>
          Respire fundo. Não há julgamentos aqui, apenas você e seus
          sentimentos.
        </Text>
      </View>
      <View>
        <ScrollView>
          <FlatList
            contentContainerStyle={{ gap: 8, height: 30 }}
            data={getEmotionsQuery.data}
            renderItem={({ item }) => (
              <EmotionButton
                active={item.id === selectedEmotion}
                value={item.id}
                onPress={(value) => {
                  setEmotion(value);
                }}
                content={item.emotion}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
