import { View, Text, TouchableOpacity } from "react-native";

interface AnswerButtonProps {
  text: string;
  onClick?: () => void;
}

export default function AnswerButton(props: AnswerButtonProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        props.onClick?.();
      }}
      className="group bg-white text-customblack-max active:bg-secondary-max  w-full border border-customblack-min h-10 flex justify-center rounded-md px-4"
    >
      <Text className="text-sm font-secondary-semibold group-active:text-white">
        {props.text}
      </Text>
    </TouchableOpacity>
  );
}
