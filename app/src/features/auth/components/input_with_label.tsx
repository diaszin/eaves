import { ComponentType, ReactElement } from "react";
import { IconType } from "react-icons/lib";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { JSX } from "react/jsx-runtime";

interface InputWithLabelProps extends TextInputProps {
  label: string;
  placeholder?: string;
  leading?: ReactElement;
  trailing?: ReactElement;
}

export default function InputWithLabel(props: InputWithLabelProps) {
  return (
    <View className="flex flex-col bg-white gap-2">
      <Text>{props.label}</Text>
      <View className="flex flex-row items-center justify-between h-10  bg-secondary-min px-2 py-4 rounded-xl">
        <View className="flex flex-row items-center gap-2">
          {props.leading}
          <TextInput
            className="outline-none placeholder:flex placeholder:flex-row placeholder:items-center placeholder:justify-center"
            placeholder={props.placeholder}
            {...props}
          />
        </View>
        {props.trailing}
      </View>
    </View>
  );
}
