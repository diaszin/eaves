export interface CustomDateTimePickerProps{
    classname?: string
    onChange: (date: Date) => void
    value: Date
    label: string
}