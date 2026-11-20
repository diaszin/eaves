# Implementation Plan: Animação de sucesso no painel de confirmação

**Branch**: `002-success-lottie-animation` | **Date**: 2026-11-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-success-lottie-animation/spec.md`

## Summary

Substituir o ícone estático `MdCheckCircle` do `SuccesssBottomSheet` pela animação
`app/assets/animations/json/success.json`, renderizada com `lottie-react-native`. A animação toca
uma vez, reinicia a cada abertura do painel e não interfere no layout nem no fluxo de fechamento.
Mudança restrita ao app; nenhuma alteração de API.

## Technical Context

**Language/Version**: TypeScript ~6.0 (strict), React 19.2, React Native 0.86, Expo SDK 57

**Primary Dependencies**: `lottie-react-native` ~7.3.8 (versão alinhada ao SDK 57 em `bundledNativeModules.json`; ainda não instalada), `@expo/ui` BottomSheet (existente), NativeWind

**Storage**: N/A (asset JSON local, 300x300, 30 fps, 60 quadros = 2 s)

**Testing**: O app não possui framework de testes; validação manual conforme [quickstart.md](quickstart.md) + `yarn lint` e `tsc` no app

**Target Platform**: iOS, Android e web (Expo)

**Project Type**: mobile-app (cliente fino)

**Performance Goals**: animação inicia em até 1 s após o painel ficar visível (SC-002)

**Constraints**: tamanho próximo ao do ícone atual (64px) dentro do painel de 200px de altura; painel funcional se a animação falhar

**Scale/Scope**: 1 componente alterado, 1 dependência adicionada; 7 telas consumidoras sem mudança de uso

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. API-Centric | Pass. Mudança puramente visual no cliente; sem regra de negócio. |
| II. RBAC | Pass. Sem endpoint ou tela nova; nenhum acesso novo. |
| III. Dados sensíveis | Pass. Nenhum dado pessoal coletado ou logado. |
| IV. Contratos/Schema | Pass. Sem API nem migração. |
| V. Tipado, simples | Pass. TypeScript, solução mínima. Sem testes automatizados no app (não há infraestrutura); ver Complexity Tracking. |
| Stack: docs Expo da versão em uso | Aplicado: consultar docs da v57 antes de instalar/usar (ver research.md). |
| Texto em pt-BR | Pass. Textos existentes mantidos. |

Sem violações. Reavaliado após o design: sem mudanças.

## Project Structure

### Documentation (this feature)

```text
specs/002-success-lottie-animation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── success-bottom-sheet.md
└── tasks.md             # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
app/
├── package.json                           # + lottie-react-native
├── assets/animations/json/success.json    # existente, inalterado
└── src/components/SuccesssBottomSheet.tsx # alterado: ícone -> animação
```

**Structure Decision**: alteração in-place no componente compartilhado existente; sem novos arquivos de código.

## Complexity Tracking

Sem violações a justificar. Observação: a ausência de testes automatizados no app é uma limitação
pré-existente; a verificação é manual (quickstart).
