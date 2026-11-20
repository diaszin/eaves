import type { ReactNode } from "react";

/** Versão móvel: devolve os filhos sem alteração (as pilhas nativas já animam). */
export default function ScreenFade({ children }: { children: ReactNode }) {
  return children;
}
