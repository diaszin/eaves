import { FormOptions, useForm } from "@tanstack/react-form";
import { MultiStepData } from "../types/signup.type";

type UseMultiStepFormProps = Omit<
  FormOptions<
    MultiStepData,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >,
  "defaultValues"
>;

export function useMultiStepForm(props: UseMultiStepFormProps) {
  return useForm({
    defaultValues: {} as MultiStepData,
    ...props,
  });
}
