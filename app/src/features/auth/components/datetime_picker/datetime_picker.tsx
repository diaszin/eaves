import DateTimePicker from "@expo/ui/community/datetime-picker";
import { CustomDateTimePickerProps } from "./datetime_picker.type";

export function CustomDateTimePicker(props: CustomDateTimePickerProps) {
  return (
    <DateTimePicker
      value={props.value}
      onValueChange={(_, selectedDate) => {
        props.onChange(selectedDate);
      }}
      mode="date"
      presentation="dialog"
    />
  );
}
