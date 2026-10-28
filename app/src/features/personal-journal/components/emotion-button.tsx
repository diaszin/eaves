import { IconType } from "react-icons/lib";
import { View, Text, TouchableOpacity } from "react-native";

interface EmotionButtonProps {
  value: number;
  content: string;
  active: boolean;
  onPress?: (value: number) => void;
}

export default function EmotionButton(props: EmotionButtonProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        props.onPress?.(props.value);
      }}
      className={
        props.active
          ? "bg-primary-max text-white rounded-lg border-[0.6px] border-black flex items-center justify-center w-20 px-14"
          : "bg-secondary-min rounded-lg border-[0.6px] border-black flex items-center justify-center w-20 px-14"
      }
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
    </TouchableOpacity>
  );
}
