/**
 * Versão móvel (sem efeito) do módulo de view transitions.
 * A implementação real para web está em `view-transition.web.ts`.
 */

export interface ViewTransitionOptions {
  /** Id do profissional cujo card participa do Hero. */
  professionalId?: number;
}

export function runWithViewTransition(
  update: () => void,
  _options?: ViewTransitionOptions,
) {
  update();
}

/** Avisa que uma tela ganhou foco (usado só na web). */
export function notifyScreenFocused() {}

export function useViewTransitionActive() {
  return false;
}

export function useProfessionalTransitionName(_id: number): string | undefined {
  return undefined;
}
