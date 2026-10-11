import { FormOptions, useForm } from "@tanstack/react-form";
import { MultiStepData } from "../types/signup.type";

type UseMultiStepFormProps = Omit<
  Parameters<typeof useForm>[0],
  "defaultValues"
>;

export function useMultiStepForm(props: UseMultiStepFormProps) {
  return useForm({
    defaultValues: {} as MultiStepData,
    ...props,
  });
}
