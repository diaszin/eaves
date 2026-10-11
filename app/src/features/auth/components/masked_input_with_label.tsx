import { ReactElement } from "react";
import { View, Text } from "react-native";
import MaskInput, { MaskInputProps } from "react-native-mask-input";

interface MaskInputWithLabelProps extends MaskInputProps {
  label: string;
  placeholder?: string;
  leading?: ReactElement;
  trailing?: ReactElement;
}

export default function MaskInputWithLabel(props: MaskInputWithLabelProps) {
  return (
    <View className="flex flex-col bg-white gap-2">
      <Text>{props.label}</Text>
      <View className="flex flex-row items-center justify-between h-10  bg-secondary-min px-2 py-4 rounded-xl">
        <View className="flex flex-row items-center gap-2 w-full">
          {props.leading}
          <MaskInput
            className="outline-none placeholder:flex placeholder:flex-row placeholder:items-center placeholder:justify-center w-full"
            placeholder={props.placeholder}
            {...props}
          />
        </View>
        {props.trailing}
      </View>
    </View>
  );
}
