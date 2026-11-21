import PressableScale from "@/shared/components/pressable-scale";
import { Text, View } from "react-native";

interface HourBadgeProps {
  startTime: string;
  endTime: string;
  isSelected?: boolean;
  onPress?: VoidFunction;
}

export default function HourBadge({
  startTime,
  endTime,
  onPress,
  isSelected,
}: HourBadgeProps) {
  return (
    <PressableScale
      onPress={onPress}
      selected={isSelected}
      selectedColors={{ borderColor: ["rgba(147,197,253,0)", "#93C5FD"] }}
      className="flex flex-col justify-center  border  gap-1 rounded-md shadow  bg-white h-14 w-[48%] p-2"
    >
      <View className="flex flex-row items-center justify-start gap-1">
        <Text className="text-customblack-max font-primary-bold">
          {startTime}
        </Text>
        <Text className="text-customblack-max font-primary-bold">a</Text>
        <Text className="text-customblack-max font-primary-bold">
          {endTime}
        </Text>
      </View>
      <View>
        {isSelected && (
          <Text className="text-[0.7rem] text-customgray">
            Horário escolhido
          </Text>
        )}
      </View>
    </PressableScale>
  );
}
