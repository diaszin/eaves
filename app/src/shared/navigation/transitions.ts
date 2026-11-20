import { useReducedMotion } from "react-native-reanimated";

const TRANSITION_DURATION_MS = 300;

/** Opções de transição (Fade through) para `screenOptions` de pilhas. */
export function useScreenTransition() {
  const reduceMotion = useReducedMotion();

  return {
    animation: reduceMotion ? ("none" as const) : ("fade" as const),
    animationDuration: TRANSITION_DURATION_MS,
  };
}

/** Opções de transição (Fade through) para `screenOptions` de abas. */
export function useTabTransition() {
  const reduceMotion = useReducedMotion();

  return {
    animation: reduceMotion ? ("none" as const) : ("fade" as const),
  };
}

/**
 * Tag do elemento compartilhado (Hero) do card do profissional.
 * Retorna `undefined` quando o usuário pediu para reduzir movimento.
 */
export function useProfessionalSharedTag(id: number) {
  const reduceMotion = useReducedMotion();

  return reduceMotion ? undefined : `professional-card-${id}`;
}
