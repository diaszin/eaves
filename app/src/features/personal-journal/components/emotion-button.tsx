import PressableScale from "@/shared/components/pressable-scale";
import { IconType } from "react-icons/lib";
import { View, Text } from "react-native";

interface EmotionButtonProps {
  value: number;
  content: string;
  active: boolean;
  onPress?: (value: number) => void;
}

export default function EmotionButton(props: EmotionButtonProps) {
  return (
    <PressableScale
      onPress={() => {
        props.onPress?.(props.value);
      }}
      selected={props.active}
      selectedColors={{ backgroundColor: ["#FBF0FF", "#19648C"] }}
      className="rounded-lg border-[0.6px] border-black flex items-center justify-center w-20 px-14"
    >
      <Text
        className={
          props.active
            ? "font-secondary-semibold text-white text-sm "
            : "font-secondary-semibold text-sm"
        }
      >
        {props.content}
      </Text>
    </PressableScale>
  );
}
