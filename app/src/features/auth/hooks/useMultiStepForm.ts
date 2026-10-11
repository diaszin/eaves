import { useForm } from "@tanstack/react-form";
import { MultiStepData } from "../types/signup.type";

export function useMultiStepForm() {
  return useForm({
    defaultValues: {} as MultiStepData,
  });
}
