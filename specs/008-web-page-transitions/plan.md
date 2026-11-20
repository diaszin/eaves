# Implementation Plan: Transições entre Telas na Web

**Branch**: `008-web-page-transitions` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-web-page-transitions/spec.md`

## Summary

Somente a versão web do app do paciente (`app/`). Na web, a pilha de navegação não anima: cada tela
é um bloco que apenas alterna entre visível e oculto, e o Hero do Reanimated (`sharedTransitionTag`)
não tem efeito. O plano usa duas camadas, ambas só na web e sem dependência nova:

1. **Fade through**: cada tela da pilha ganha um envoltório (`screenLayout`) que, ao ganhar foco,
   esmaece de 0 a 1 depois de um pequeno atraso (a tela anterior some de imediato). As abas já animam
   pelo navegador de abas em JavaScript.
2. **Hero**: API nativa do navegador *View Transitions* (`document.startViewTransition`) com um nome de
   transição por profissional no card, envolvendo as navegações do fluxo profissional → agendamento
   (toque no card, botão voltar do app e voltar/avançar do navegador). Sem suporte, vale o Fade through.

Código móvel não muda: tudo entra em arquivos `.web.ts(x)` ou atrás de checagem de plataforma.

## Technical Context

**Language/Version**: TypeScript (strict). React 19.2.3, React Native 0.86.3, react-native-web ~0.21.0, Expo ~57.0.24, Expo Router ~57.0.22, Reanimated 4.5.1

**Primary Dependencies**: existentes. Nenhuma nova. Ver [research.md](research.md)

**Storage**: N/A

**Testing**: o app não tem framework de testes (mesma exceção das features 003–007); validação manual em navegador por [quickstart.md](quickstart.md), mais `npx tsc --noEmit` e lint

**Target Platform**: web (Chrome, Edge, Firefox e Safari atuais, computador e celular). Android/iOS inalterados (FR-011)

**Project Type**: mobile-app com saída web (`expo start --web`, `expo export --platform web`)

**Performance Goals**: transições de 200–500 ms sem travar a interação (SC-003)

**Constraints**: textos em pt-BR; sem alterar funcionalidade nem endereços das telas (FR-010); código móvel intocado; consultar a documentação do Expo v57 ([app/AGENTS.md](../../app/AGENTS.md)); *View Transitions* não existe em todo navegador, logo deve haver alternativa

**Scale/Scope**: 1 módulo web novo, 1 ajuste no `EmployeesCard`, 3 layouts de pilha, 1 tela de lista, 1 CSS global

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. API-Centric | Pass. Puramente visual no cliente; sem regra de negócio nem acesso a dados. |
| II. RBAC | Pass. Sem endpoint ou tela nova; guardas de rota inalterados. |
| III. Dados sensíveis | Pass. Não coleta nem expõe dados. |
| IV. Contratos/Schema | Pass. Sem mudança de API ou banco. |
| V. Tipado, simples | Pass. TypeScript estrito, estrutura em `app/src/*` respeitada. Sem dependência nova (YAGNI): API do navegador e Reanimated existente. Sem infra de testes no app: mesma exceção das features anteriores. |
| Stack / pt-BR | Pass. Expo/Expo Router mantidos; sem texto novo visível. |

Reavaliado após o design: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/008-web-page-transitions/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── web-transitions.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
app/src/
├── shared/navigation/
│   ├── transitions.ts                  # existente (007): móvel; ganha opção para web
│   ├── view-transition.ts              # NOVO: tipos + versão sem efeito (móvel)
│   ├── view-transition.web.ts          # NOVO: startViewTransition, escuta popstate, alternativa
│   └── web-screen-fade.web.tsx         # NOVO: envoltório de tela com Fade through
│   └── web-screen-fade.tsx             # NOVO: versão móvel, devolve os filhos sem alteração
├── app/
│   ├── _layout.tsx                     # screenLayout nas pilhas (raiz)
│   ├── (auth)/_layout.tsx              # screenLayout
│   └── (app)/(authenticated)/_layout.tsx  # screenLayout
└── features/appointments/
    ├── components/employees-card.tsx   # nome de transição por profissional (web)
    └── screens/appointments-view.tsx   # push envolvido em view transition (web)
```

**Structure Decision**: a divisão por extensão (`.web.ts`/`.ts`) mantém o código móvel idêntico:
o Metro escolhe a versão certa por plataforma, e a versão móvel é sem efeito.

## Complexity Tracking

Sem violações a justificar. Risco registrado: o Hero depende de uma API do navegador (*View
Transitions*) e de capturar a atualização da tela após voltar/avançar; FR-007 garante a alternativa
(Fade through) e a verificação fica no quickstart.
