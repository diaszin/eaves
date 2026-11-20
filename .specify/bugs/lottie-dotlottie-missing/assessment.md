# Bug Assessment: Módulo @lottiefiles/dotlottie-react não resolvido ao iniciar o projeto

- **Slug**: lottie-dotlottie-missing
- **Created**: 2026-11-20
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: high

## Report (verbatim or summarized)

> Unable to resolve module @lottiefiles/dotlottie-react. houve bug ao start projeto

## Symptom

Ao iniciar o app, o bundler falha com "Unable to resolve module @lottiefiles/dotlottie-react", impedindo o app de abrir. Esperado: o app inicia normalmente com a animação de sucesso funcionando.

## Reproduction

1. Na branch com a feature 002 (commit b8efa7d), rodar `yarn start` / `yarn web` em `app/`.
2. Metro tenta empacotar `lottie-react-native` e falha ao resolver o módulo.

[NEEDS CLARIFICATION: em qual plataforma ocorreu (web ou nativo)? A análise indica web, ver hipótese.]

## Suspected Code Paths

- `app/node_modules/lottie-react-native/src/LottieView/index.web.tsx` — a implementação web importa `@lottiefiles/dotlottie-react`.
- `app/package.json` — declara `lottie-react-native` ~7.3.8, mas não declara o pacote acima.
- `app/src/components/SuccesssBottomSheet.tsx:3` — importa `lottie-react-native`, o que puxa a implementação web nessa plataforma. O componente é usado por 7 telas, então o erro afeta o app inteiro.

## Root Cause Hypothesis

O `lottie-react-native` 7.3.8 lista `@lottiefiles/dotlottie-react` (^0.13.5) como peer dependency opcional (`peerDependenciesMeta.optional: true`), usada só pela build web. O `yarn` 1.x não instala peers opcionais, e `node_modules/@lottiefiles` não existe. No web, o Metro resolve `index.web.tsx` e falha. O plano (research.md) cobriu só a instalação do pacote principal e não considerou o peer web. Confiança: alta (pacote ausente confirmado em disco; cenário nativo não foi reproduzido).

## Proposed Remediation

**Preferred**: instalar o peer em `app/` com `yarn add @lottiefiles/dotlottie-react@^0.13.5` (ou `npx expo install @lottiefiles/dotlottie-react`), mantendo a mesma implementação do componente.

**Alternatives**:
- Importar `lottie-react-native` só em plataformas nativas via arquivo `.native.tsx`, com um fallback web sem animação. Evita a dependência, mas perde a animação no web.
- Se o erro ocorrer também no nativo, investigar cache do Metro (`npx expo start -c`) antes de mudar código.

**Files likely to change**:
- `app/package.json` (e `app/yarn.lock`, que está ignorado pelo git)

**Tests to add or update**:
- Sem framework de testes no app; validar com `yarn web` e com `npx expo export --platform web` (`yarn build:web`), confirmando que o bundle compila e a animação aparece.

## Risks & Considerations

- O CI/deploy do app web (`build:web`) quebraria com o mesmo erro até a dependência ser adicionada.
- A dependência nova aumenta o bundle web (WASM do dotLottie); versão deve respeitar `^0.13.5`.
- A spec e o plano devem registrar a dependência web para evitar regressão.

## Open Questions

- [NEEDS CLARIFICATION: plataforma em que o erro apareceu (web, Android ou iOS)?]
