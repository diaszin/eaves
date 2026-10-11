import { CustomDateTimePickerProps } from "./datetime_picker.type";

export function CustomDateTimePicker(props: CustomDateTimePickerProps) {
  const formattedDate =
    props.value instanceof Date ? props.value.toISOString().split("T")[0] : "";

  return (
    <input
      type="date"
      value={formattedDate}
      className={props.classname}
      onChange={(e) => {
        const choosedDate = e.currentTarget.valueAsDate;

        if (choosedDate) {
          props.onChange(choosedDate);
        }
      }}
    />
  );
}
