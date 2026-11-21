import PressableScale from "@/shared/components/pressable-scale";
import { Text, View } from "react-native";
import EmotionButton from "./emotion-button";

interface PersonalJournalCardProps {
  emotion: string;
  publishDate: string;
  onPress?: VoidFunction;
}

export default function PersonalJournalCard(props: PersonalJournalCardProps) {
  const convertedDate = new Date(Date.parse(props.publishDate));
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Bahia",
    dateStyle: "long",
    timeStyle: "short",
  });
  const formattedPublishDate = dateFormatter.format(convertedDate);

  return (
    <PressableScale size="card"
      onPress={props.onPress}
      className="flex flex-col justify-center gap-2 w-full h-28 p-2 border  border-customgray bg-white rounded-md"
    >
      <Text className="text-lg text-customblack-min font-primary-bold ">
        {formattedPublishDate}
      </Text>
      <View className="bg-secondary-max w-min px-4 py-2 rounded-sm">
        <Text className="text-white font-secondary font-light">
          {props.emotion.toUpperCase()}
        </Text>
      </View>
    </PressableScale>
  );
}
