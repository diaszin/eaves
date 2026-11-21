import PressableScale from "@/shared/components/pressable-scale";
import { View, Text } from "react-native";
import { TbBrain } from "react-icons/tb";
import { MdAdd, MdPlusOne } from "react-icons/md";
import { useRouter } from "expo-router";

interface PersonalJournalCreateCardProps {}

export default function PersonalJournalCreateCard() {
  const router = useRouter();

  return (
    <View className="flex flex-col items-center gap-3">
      <View className="rounded-full w-14 h-14 bg-secondary-min flex flex-col items-center justify-center">
        <TbBrain className="text-secondary-max" size={30} />
      </View>
      <View className="flex flex-col gap-2 items-center justify-center">
        <Text className="text-center w-52 text-[1rem] font-primary-medium">
          Seus pensamentos estão sempre seguros aqui
        </Text>
        <Text className="text-center w-64 text-[0.8rem] font-primary-regular text-customgray">
          Nenhuma informação é compartilhada. Este espaço pertence unicamente a
          você.
        </Text>
      </View>
      <View className="flex flex-col items-center w-full">
        <PressableScale
          onPress={() => {
            router.push("/(app)/(authenticated)/journal/create");
          }}
          className="bg-primary-min rounded-md w-[20rem] h-10 flex flex-row items-center justify-center gap-1"
        >
          <MdAdd className="text-white" />
          <Text className="text-white">Escrever uma nova memória</Text>
        </PressableScale>
      </View>
    </View>
  );
}
