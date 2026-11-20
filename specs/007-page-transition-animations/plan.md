# Implementation Plan: Animações de Transição entre Telas

**Branch**: `007-page-transition-animations` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-page-transition-animations/spec.md`

## Summary

Somente no aplicativo móvel (`app/`). O card do profissional passa a ser um elemento compartilhado
(Hero) entre a lista de profissionais e a tela de agendamento, usando as transições de elemento
compartilhado do `react-native-reanimated` (já instalado, 4.5.1) com `sharedTransitionTag` único por
profissional. Todas as demais navegações usam esmaecimento (`animation: "fade"` nas pilhas e nas
abas), centralizado em um módulo de transições para que nenhuma navegação fique sem definição. Com
"reduzir movimento" ativo, as transições viram troca sem animação. Sem mudanças no servidor, no
painel ou no banco.

## Technical Context

**Language/Version**: TypeScript (strict). React Native 0.86.3 + Expo ~57.0.24, Expo Router ~57.0.22, NativeWind

**Primary Dependencies**: existentes: `react-native-reanimated` 4.5.1, `react-native-screens` ~4.26, `react-native-worklets` 0.10.1. Nenhuma nova. Ver [research.md](research.md)

**Storage**: N/A

**Testing**: o app não tem framework de testes (mesma exceção das features 003–006); validação manual por [quickstart.md](quickstart.md), checagem de tipos e `yarn lint`

**Target Platform**: Android (principal), iOS e web (melhor esforço). Exige build de desenvolvimento (não roda no Expo Go) por causa da flag nativa do Reanimated

**Project Type**: mobile-app

**Performance Goals**: transições de 200–500 ms sem queda perceptível de fluidez (SC-003)

**Constraints**: textos em pt-BR; sem alterar comportamento funcional das telas; consultar a documentação do Expo v57 antes de escrever código ([app/AGENTS.md](../../app/AGENTS.md)); transição de elemento compartilhado do Reanimated é recurso experimental e precisa de flag estática habilitada

**Scale/Scope**: 4 layouts de navegação (raiz, autenticado, auth, abas), 2 componentes/telas do fluxo Hero, 1 módulo novo de transições, 1 ajuste no `package.json`

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. API-Centric | Pass. Feature puramente visual no cliente; nenhuma regra de negócio nem acesso a dados novo. |
| II. RBAC | Pass. Nenhum endpoint ou tela nova; papéis e guardas de rota inalterados. |
| III. Dados sensíveis | Pass. Não coleta nem expõe dados; apenas move o card já exibido. |
| IV. Contratos/Schema | Pass. Sem mudança de API ou de banco. |
| V. Tipado, simples | Pass. TypeScript estrito, estrutura em `app/src/*` respeitada. Sem dependência nova (YAGNI): Reanimated já está no projeto. Sem infra de testes no app: mesma exceção das features anteriores. |
| Stack / pt-BR | Pass. Expo/Expo Router mantidos; sem texto novo visível ao usuário. |

Reavaliado após o design: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/007-page-transition-animations/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── transitions.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
app/
├── package.json                                   # flag estática do Reanimated
└── src/
    ├── shared/navigation/transitions.ts           # NOVO: opções de transição + hook de reduzir movimento
    ├── app/
    │   ├── _layout.tsx                            # Stack raiz com opções de fade
    │   ├── (auth)/_layout.tsx                     # Stack de auth com fade
    │   └── (app)/(authenticated)/
    │       ├── _layout.tsx                        # Stack autenticada com fade
    │       └── (home)/_layout.tsx                 # Tabs com animation "fade"
    └── features/appointments/
        ├── components/employees-card.tsx          # sharedTransitionTag por profissional
        └── screens/
            ├── appointments-view.tsx              # lista: tag no card
            └── appointments-create.tsx            # agendamento: mesmo card/tag
```

**Structure Decision**: toda a configuração de transição fica em `shared/navigation/transitions.ts`
e é consumida pelos layouts; o fluxo Hero se limita ao componente `EmployeesCard`, que já é usado
nas duas telas.

## Complexity Tracking

Sem violações a justificar. Risco registrado: o recurso de elemento compartilhado do Reanimated é
experimental; FR-010 (fallback para fade) cobre o caso em que não renderiza (ver research.md).
