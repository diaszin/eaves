import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

import type { ViewTransitionOptions } from "./view-transition";

export type { ViewTransitionOptions };

/** Tempo máximo esperando a nova tela ganhar foco antes de seguir sem Hero. */
const MAX_WAIT_MS = 400;

/** Rotas do fluxo: lista de profissionais e agendamento. */
const PROFESSIONAL_FLOW_PATH = /(^|\/)appointments(\/create)?\/?$/;

type ViewTransitionLike = { finished: Promise<void>; skipTransition(): void };
type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    callback: () => Promise<void> | void,
  ) => ViewTransitionLike;
};

const listeners = new Set<() => void>();
let active = false;
let activeProfessionalId: number | null = null;
let lastProfessionalId: number | null = null;
let finishWaiting: (() => void) | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function isSupported() {
  return (
    typeof document !== "undefined" &&
    typeof (document as DocumentWithViewTransition).startViewTransition ===
      "function"
  );
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Inicia a view transition. `update` pode ser vazio (popstate: o roteador já
 * trata a navegação). Resolve quando a nova tela ganha foco, com limite de tempo.
 */
function start(update: (() => void) | null, professionalId: number | null) {
  if (!isSupported() || prefersReducedMotion() || active) {
    update?.();
    return;
  }

  active = true;
  activeProfessionalId = professionalId;
  lastProfessionalId = professionalId ?? lastProfessionalId;
  // O nome precisa estar no DOM antes da captura do estado antigo.
  flushSync(emit);

  // eslint-disable-next-line prefer-const
  let transition: ViewTransitionLike | undefined;
  transition = (document as DocumentWithViewTransition).startViewTransition!(
    () =>
      new Promise<void>((resolve) => {
        let done = false;
        const end = () => {
          if (done) return;
          done = true;
          finishWaiting = null;
          resolve();
        };
        finishWaiting = end;
        setTimeout(() => {
          // Sem mudança de foco no prazo: segue sem animação, sem congelar a tela.
          if (!done) transition?.skipTransition();
          end();
        }, MAX_WAIT_MS);
        update?.();
      }),
  );

  transition.finished
    .catch(() => {})
    .finally(() => {
      active = false;
      activeProfessionalId = null;
      finishWaiting = null;
      emit();
    });
}

export function runWithViewTransition(
  update: () => void,
  options?: ViewTransitionOptions,
) {
  start(update, options?.professionalId ?? null);
}

/** Avisa que uma tela ganhou foco: libera a view transition em andamento. */
export function notifyScreenFocused() {
  finishWaiting?.();
}

export function useViewTransitionActive() {
  return useSyncExternalStore(
    subscribe,
    () => active,
    () => false,
  );
}

/** Nome da transição do card, só para o profissional em navegação. */
export function useProfessionalTransitionName(id: number): string | undefined {
  const current = useSyncExternalStore(
    subscribe,
    () => activeProfessionalId,
    () => null,
  );
  return current === id ? `professional-card-${id}` : undefined;
}

// Voltar/avançar do navegador: o ouvinte é registrado no carregamento do módulo,
// antes do roteador, para capturar o estado antigo da tela (FR-005).
if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    // Só nas telas do fluxo profissional → agendamento (FR-009, SC-005).
    if (
      lastProfessionalId === null ||
      !PROFESSIONAL_FLOW_PATH.test(location.pathname)
    ) {
      return;
    }
    start(null, lastProfessionalId);
  });
}
