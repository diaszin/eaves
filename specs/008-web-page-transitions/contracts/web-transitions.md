# Contrato de UI: Transições na Web

Pasta: `app/src/shared/navigation/`. Cada módulo tem versão móvel (sem efeito) e `.web`.

## Interface

- `runWithViewTransition(update: () => void, options?: { name?: string }): void`
  - Web: se houver suporte e movimento não estiver reduzido, inicia `document.startViewTransition`, executa `update` e resolve quando o foco da tela mudar (limite de 400 ms); caso contrário, apenas executa `update`.
  - Móvel: apenas executa `update`.
- `useViewTransitionActive(): boolean`: verdadeiro enquanto uma view transition está ativa (só web; falso no móvel).
- `ScreenFade` (componente): envoltório de tela. Web: opacidade 0→1 em ~250 ms com atraso de 60 ms ao ganhar foco, desligado com reduzir movimento ou com view transition ativa. Móvel: devolve os filhos sem alteração.
- `useProfessionalTransitionName(id: number): string | undefined`: devolve `professional-card-{id}` apenas para o card em navegação (web); `undefined` nos demais casos e no móvel.

## Pontos de uso

| Onde | Uso |
|------|-----|
| `app/src/app/_layout.tsx`, `(auth)/_layout.tsx`, `(app)/(authenticated)/_layout.tsx` | `screenLayout` com `ScreenFade` |
| `features/appointments/screens/appointments-view.tsx` | `router.push` envolvido por `runWithViewTransition` |
| `features/appointments/screens/appointments-create.tsx` | botão voltar do app envolvido por `runWithViewTransition` |
| `features/appointments/components/employees-card.tsx` | nome de transição aplicado ao card |

## Regras

- Sem efeito no Android e no iOS: comportamento da feature 007 intacto (FR-011).
- Navegação por toque, voltar do app e voltar/avançar do navegador terminam na mesma tela e no mesmo endereço de antes (FR-010).
- Alternativa: sem suporte ou sem resolução em 400 ms, a navegação conclui com Fade through (FR-007).
