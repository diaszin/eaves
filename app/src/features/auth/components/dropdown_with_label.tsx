import { Picker, PickerProps } from "@expo/ui";
import { View, Text } from "react-native";

interface DropdownWithLabelProps extends PickerProps {
  label: string;
  data: { value: string; label: string }[];
}

export default function DropdownWithLabel(props: DropdownWithLabelProps) {
  return (
    <View className="flex flex-col bg-white gap-2">
      <Text>{props.label}</Text>
      <View className="bg-secondary-min rounded-xl">
        <Picker appearance="wheel" {...props}>
          {props.data.map((element) => (
            <Picker.Item
              key={element.value}
              label={element.label}
              value={element.value}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
}
