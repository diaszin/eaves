# Bug Verification: Módulo @lottiefiles/dotlottie-react não resolvido

- **Slug**: lottie-dotlottie-missing
- **Tested**: 2026-11-20
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: partial

## Summary

O erro de resolução do módulo não reproduz mais: os bundles web e Android compilam sem erro. Fica `partial` porque a reprodução original (iniciar o projeto e abrir o app) não foi exercida e a animação não foi vista rodando.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Pacote presente | `ls app/node_modules/@lottiefiles` | pass | `dotlottie-react` 0.13.5 e `dotlottie-web` presentes (antes: pasta inexistente) |
| Reprodução (pós-fix), web | `npx expo export --platform web` | pass | Terminou com "Exported", sem "Unable to resolve module" |
| Reprodução (pós-fix), Android | `npx expo export --platform android` | pass | Bundle compilado; a única ocorrência de "error" na saída é o nome do asset `error.png` do expo-router |
| Reprodução (pós-fix), start do app | `yarn start` / `yarn web` + abrir tela | not-run | Exige servidor de desenvolvimento e navegador/dispositivo |
| Testes novos/atualizados | n/a | not-run | O app não tem framework de testes |
| Type-check | `npx tsc --noEmit` | pass | 0 erros relacionados a `lottie` ou `SuccesssBottomSheet` |
| Lint | `npx expo lint src/components/SuccesssBottomSheet.tsx` | not-run | Rodado na etapa de implementação (0 erros); não repetido, pois o componente não mudou |

## Output Excerpts

- Web: `Exported: ...exp-web`
- Android: `Exported: ...exp-android`

## Residual Risks

- A animação não foi vista em execução (web, Android ou iOS): tamanho de 100px, reinício ao reabrir e modos claro/escuro seguem pendentes (T007 da feature 002).
- A plataforma em que o erro original ocorreu não foi informada; o iOS não foi testado.
- O `yarn.lock` está ignorado pelo git, então outra máquina pode resolver versões diferentes do peer. O `package.json` fixa a 0.13.5, o que limita o risco.
- Alterações da correção ainda sem commit.

## Recommendation

Fechar o bug depois de uma conferência rápida: rodar `yarn web` (ou o app no dispositivo), abrir uma tela que usa o painel de sucesso e ver a animação. Se o erro voltar em dispositivo nativo, tentar `npx expo start -c` e reabrir com `/speckit-bug-assess`.
