import { createContext } from "react";
import { useMultiStepForm } from "../hooks/useMultiStepForm";

type MultiStepContextType = {
  next: () => void;
  previous: () => void;
  step: number;
  form: ReturnType<typeof useMultiStepForm>;
};

export const MultiStepContext = createContext<MultiStepContextType | undefined>(
  undefined,
);
