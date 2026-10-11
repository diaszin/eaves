import { View, Text} from "react-native";
import { CustomDateTimePickerProps } from "./datetime_picker.type";

export function CustomDateTimePicker(props: CustomDateTimePickerProps) {
  const formattedDate =
    props.value instanceof Date ? props.value.toISOString().split("T")[0] : "";

  return (
    <View className="flex flex-col bg-white gap-2">
      <Text>{props.label}</Text>
      <View className="flex flex-row items-center justify-between h-10  bg-secondary-min px-2 py-4 rounded-xl">
        <View className="flex flex-row items-center gap-2 w-full">
          <input
            type="date"
            value={formattedDate}

            className={`w-full bg-transparent outline-none ${props.classname}`}
            onChange={(e) => {
              const choosedDate = e.currentTarget.valueAsDate;

              if (choosedDate) {
                props.onChange(choosedDate);
              }
            }}
          />
        </View>
      </View>
    </View>
  );
}
