# Bug Fix: Rolagem vertical/horizontal no perfil do estagiário

- **Slug**: trainee-profile-scroll-overflow
- **Fixed**: 2026-11-19
- **Assessment**: ./assessment.md
- **Status**: applied (não verificado em navegador)

## Summary

Removido o `w-screen` (100vw) do shell, adicionado `min-w-0`/`min-h-0` nos contêineres flex e restrito o contêiner de rolagem da `UsersPage` ao eixo vertical; o card do gráfico agora é `relative` (contém o `sr-only`) e o SVG tem `max-w-full`.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `platform/src/shared/components/layout/ThreePaneLayout.tsx` | modified | `w-screen` → `w-full`; `main` ganha `min-w-0` |
| `platform/src/features/users/screens/UsersPage.tsx` | modified | wrapper `min-h-0`; contêiner interno `min-h-0 overflow-y-auto overflow-x-hidden` |
| `platform/src/features/users/components/TraineeAppointmentsChart.tsx` | modified | `<section>` `relative min-w-0`; SVG `max-w-full` |

## Tests Added or Updated

- Nenhum: o `platform` não tem infraestrutura de testes de layout (conforme a assessment, verificação manual).

## Local Verification

- `npx tsc --noEmit` (platform) → sem erros.
- Manual: **não realizada** (bug não reproduzido antes nem depois da mudança).

## Deviations from Assessment

- Nenhuma no código. A hipótese de causa tinha confiança baixa-média e os itens `[NEEDS CLARIFICATION]` seguem em aberto; o fix foi aplicado mesmo assim a pedido do usuário.

## Follow-ups

- Validar no navegador `/trainees/:id` como coordenador (1280/1024/768 px; estados loading, vazio, com dados).
- Conferir as demais telas, pois `ThreePaneLayout` é compartilhado.
- Se o bug persistir, medir no DevTools o elemento com `scrollWidth > clientWidth` e rodar `/speckit-bug-assess` de novo.
