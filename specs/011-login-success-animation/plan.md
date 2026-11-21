# Implementation Plan: Animação de sucesso no botão de login

**Branch**: `011-login-success-animation` | **Date**: 2026-11-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/011-login-success-animation/spec.md`

## Summary

Ao ter o login aceito (e-mail/senha ou Microsoft), o conteúdo do botão é trocado pela animação
`app/assets/animations/json/check-mark.json` (via `lottie-react-native`, já instalada), o fundo do
botão fica verde e o `router.replace("/")` passa a ser chamado só no `onAnimationFinish`, com um
tempo limite de segurança. Um componente compartilhado novo encapsula a animação; a tela de login
guarda o estado "login aceito" por botão. Mudança restrita ao app; nenhuma alteração de API.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict), React 19.2, React Native 0.86, Expo SDK 57

**Primary Dependencies**: `lottie-react-native` ~7.3.8 (já em `app/package.json`), `react-native-reanimated` (existente, `PressableScale`), NativeWind, `@tanstack/react-query`, `expo-router`

**Storage**: N/A (asset JSON local, 350x350, 30 fps, 70 quadros ≈ 2,33 s)

**Testing**: O app não possui framework de testes; validação manual conforme [quickstart.md](quickstart.md) + `yarn lint` e `tsc` em `app/`

**Target Platform**: iOS, Android e web (Expo)

**Project Type**: mobile-app (cliente fino)

**Performance Goals**: redirecionamento em até 1 s após o fim da animação (SC-002)

**Constraints**: animação dentro do botão (`min-h-12`, 48px) sem alterar dimensões; botão desabilitado durante a animação; um único redirecionamento

**Scale/Scope**: 1 tela alterada (`login.tsx`), 1 componente novo, 0 dependências novas

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. API-Centric | Pass. Mudança puramente visual no cliente; nenhuma regra de negócio movida. |
| II. RBAC | Pass. Sem endpoint ou tela nova; a tela de login é pública e nada muda no acesso. |
| III. Dados sensíveis | Pass. Nenhum dado novo coletado ou logado. |
| IV. Contratos/Schema | Pass. Sem API nem migração. |
| V. Tipado, simples | Pass. TypeScript estrito, solução mínima, segue `src/shared/components` e `src/features/auth`. Sem testes automatizados no app (não há infraestrutura); ver Complexity Tracking. |
| Stack: docs Expo da versão em uso | Aplicado: ver research.md (docs v57 de `lottie-react-native`). |
| Texto em pt-BR | Pass. Nenhum texto novo para o usuário. |

Sem violações. Reavaliado após o design: sem mudanças.

## Project Structure

### Documentation (this feature)

```text
specs/011-login-success-animation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── button-success-check.md
└── tasks.md             # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
app/
├── assets/animations/json/check-mark.json                     # existente, inalterado
└── src/
    ├── shared/components/button-success-check.tsx             # novo: animação + fim/tempo limite
    └── features/auth/screens/login.tsx                        # alterado: estado, botões, redirecionamento
```

**Structure Decision**: um componente novo e pequeno em `shared/components` (padrão de `pressable-scale.tsx`), consumido pela tela de login; sem mudanças em `AuthProvider` nem em `PressableScale`.

## Complexity Tracking

Sem violações a justificar. Observação: a ausência de testes automatizados no app é uma limitação
pré-existente; a verificação é manual (quickstart).
