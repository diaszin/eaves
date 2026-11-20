# Bug Fix: Módulo @lottiefiles/dotlottie-react não resolvido

- **Slug**: lottie-dotlottie-missing
- **Fixed**: 2026-11-20
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

Adicionada ao app a dependência `@lottiefiles/dotlottie-react` 0.13.5, peer opcional exigido pela implementação web do `lottie-react-native`, para que o bundle web resolva o módulo.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `app/package.json` | modified | + `"@lottiefiles/dotlottie-react": "0.13.5"` (versão exata, dentro do peer `^0.13.5`) |
| `app/yarn.lock` | modified | ignorado pelo git (`app/.gitignore`); traz também `@lottiefiles/dotlottie-web` 0.44.0 |

## Tests Added or Updated

Nenhum: o app não possui framework de testes (ver plan.md).

## Local Verification

- `npx expo export --platform web` em `app/` → concluiu com "Exported: dist", sem erro de resolução.
- Não rodei o app em dispositivo/emulador nem conferi visualmente a animação no navegador.

## Deviations from Assessment

- A primeira instalação (`npx expo install`) puxou 0.22.3, fora do peer `^0.13.5`. Reinstalei com `yarn add @lottiefiles/dotlottie-react@^0.13.5`, que resolveu 0.13.5 e gravou a versão exata no `package.json`.
- A pergunta aberta (plataforma do erro) segue sem resposta; a correção cobre o web.

## Follow-ups

- Rodar `yarn web` e abrir uma tela que usa o painel para ver a animação.
- Registrar a dependência web no plano/research da feature 002.
- Se o erro ocorreu em Android/iOS, tentar `npx expo start -c`.
