import PressableScale from "@/shared/components/pressable-scale";
import { ActivityIndicator, Text } from "react-native";

interface AnswerButtonProps {
  text: string;
  onClick?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export default function AnswerButton(props: AnswerButtonProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      disabled={props.disabled}
      onPress={() => {
        props.onClick?.();
      }}
      className="group bg-white text-customblack-max active:bg-secondary-max w-full border border-customblack-min h-10 flex flex-row items-center justify-center rounded-md px-4"
    >
      {props.isLoading ? (
        <ActivityIndicator size="small" color="#2563EB" />
      ) : (
        <Text className="text-sm font-secondary-semibold group-active:text-white">
          {props.text}
        </Text>
      )}
    </PressableScale>
  );
}
