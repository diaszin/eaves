---

description: "Lista de tarefas: Animações de Transição entre Telas"
---

# Tasks: Animações de Transição entre Telas

**Input**: Documentos de design em `/specs/007-page-transition-animations/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/transitions.md, quickstart.md (data-model.md não define campos restritos)

**Tests**: Não solicitados. O app não tem framework de testes; a validação é manual via [quickstart.md](quickstart.md), mais `yarn lint` e checagem de tipos.

**Organization**: Tarefas agrupadas por história de usuário. Todos os caminhos são relativos à raiz do repositório; o escopo é só `app/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: história de usuário a que pertence (US1, US2)

## Phase 1: Setup

**Purpose**: habilitar o recurso nativo exigido pelo Hero

- [X] T001 Consultar a documentação do Expo v57 (https://docs.expo.dev/versions/v57.0.0/) e a do Reanimated 4.5 sobre transições de elemento compartilhado e a flag estática, conforme `app/AGENTS.md`, antes de codar
- [X] T002 Habilitar `ENABLE_SHARED_ELEMENT_TRANSITIONS` em `app/package.json` (chave `reanimated.staticFeatureFlags`) e confirmar que o `babel.config.js` mantém o plugin do Worklets/Reanimated

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: módulo central de transições, usado pelas duas histórias

**⚠️ CRITICAL**: nenhuma história começa antes desta fase

- [X] T003 Criar `app/src/shared/navigation/transitions.ts` conforme [contracts/transitions.md](contracts/transitions.md): `useScreenTransition()` (`animation: "fade"` e `animationDuration: 300`, ou `"none"` com reduzir movimento), `useTabTransition()` (`"fade"` ou `"none"`) e `professionalSharedTag(id)` (`professional-card-{id}` ou `undefined` com reduzir movimento), todos baseados em `useReducedMotion()` do Reanimated

**Checkpoint**: módulo pronto, sem uso ainda

---

## Phase 3: User Story 1 - Transição Hero ao escolher um profissional (Priority: P1) 🎯 MVP

**Goal**: o card do profissional escolhido viaja da lista até o cabeçalho da tela de agendamento e volta ao voltar.

**Independent Test**: cenários 1, 2, 3 e 6 do [quickstart.md](quickstart.md) (ida, volta, lista rolada, toques repetidos).

- [X] T004 [US1] Em `app/src/features/appointments/components/employees-card.tsx`, trocar o `View` externo do card por `Animated.View` do Reanimated com `sharedTransitionTag={professionalSharedTag(props.id)}` (FR-001, FR-003); manter aparência e estilos atuais
- [X] T005 [US1] Em `app/src/features/appointments/screens/appointments-view.tsx`, bloquear novo `router.push` enquanto a navegação para o agendamento estiver em andamento, liberando quando a tela voltar ao foco (`useFocusEffect`) (FR-007)
- [X] T006 [US1] Em `app/src/features/appointments/screens/appointments-create.tsx`, garantir que o `EmployeesCard` do cabeçalho recebe o `id` do profissional (`+id`) para gerar a mesma tag da lista, e que o conteúdo abaixo do cabeçalho aparece com fade suave (FR-001, FR-002)
- [X] T007 [US1] Validar o fallback de FR-010: com o card sem tag (reduzir movimento ou falha do recurso), a navegação conclui com fade; ajustar `employees-card.tsx` se a ausência da tag quebrar o layout

**Checkpoint**: Hero funciona de ponta a ponta e é demonstrável sozinho

---

## Phase 4: User Story 2 - Transição Fade through nas demais navegações (Priority: P2)

**Goal**: todas as outras navegações, incluindo troca de abas, esmaecem de forma consistente.

**Independent Test**: cenários 4, 5 e 7 do [quickstart.md](quickstart.md).

- [X] T008 [P] [US2] Aplicar `useScreenTransition()` em `screenOptions` da pilha raiz em `app/src/app/_layout.tsx` (junto com `headerShown: false`) (FR-004)
- [X] T009 [P] [US2] Aplicar `useScreenTransition()` em `screenOptions` da pilha de autenticação em `app/src/app/(auth)/_layout.tsx` (mantendo `contentStyle`) (FR-004)
- [X] T010 [P] [US2] Aplicar `useScreenTransition()` em `screenOptions` da pilha autenticada em `app/src/app/(app)/(authenticated)/_layout.tsx` (FR-004)
- [X] T011 [P] [US2] Aplicar `useTabTransition()` em `screenOptions` das abas em `app/src/app/(app)/(authenticated)/(home)/_layout.tsx` (FR-004, US2 cenário 3)
- [X] T012 [US2] Varrer `app/src/features/**/screens/*.tsx` e `app/src/templates/**` por `Stack.Screen` com `animation` próprio e remover/ajustar, para que nenhuma tela escape do fade (FR-006); registrar no contrato se houver exceção

**Checkpoint**: todas as navegações animadas

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T013 Rodar `yarn lint` e `npx tsc --noEmit` em `app/` e corrigir erros introduzidos
- [ ] T014 Gerar build de desenvolvimento (`npx expo run:android` em `app/`) e executar todos os cenários de [quickstart.md](quickstart.md), incluindo duração (SC-003: 200–500 ms em iOS/web; ~150 ms aceito no Android) e reduzir movimento (SC-006)
- [ ] T015 Se algum cenário falhar por limitação do recurso experimental, registrar a limitação e o comportamento de fallback em `specs/007-page-transition-animations/research.md`

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → US1 e US2 → Polish.
- US1 e US2 são independentes entre si após a Phase 2; ambas dependem de T003.
- Dentro de US1: T004 antes de T006 e T007; T005 independe (arquivo diferente).
- US2: T008–T011 em paralelo; T012 depois deles.

## Parallel Example

```text
Após T003: T004 e T005 (US1) em paralelo com T008, T009, T010 e T011 (US2)
```

## Implementation Strategy

- **MVP**: Phases 1–3 (Hero). Já entrega o pedido de maior impacto e pode ser demonstrado.
- **Incremental**: adicionar US2 (fade global) e depois Polish.
- Como o Hero depende de recurso experimental, validar T004–T006 em build nativo o quanto antes (T014 antecipado para após a US1, se preferir).

---

## Phase 6: Convergence

- [X] T016 Decisão: aceitar o fade padrão de ~150 ms no Android (não configurável) e ajustar SC-003 em `specs/007-page-transition-animations/spec.md` para 200–500 ms só em iOS/web per SC-003 (partial)
- [X] T017 Consultar a documentação do Expo v57 (https://docs.expo.dev/versions/v57.0.0/) e confirmar que `animation: "fade"` nas pilhas/abas e `sharedTransitionTag` em `app/src/features/appointments/components/employees-card.tsx` seguem o uso suportado; T001 foi marcada como feita usando só o código em `node_modules` per plan: Technical Context / `app/AGENTS.md` (partial)

---

## Phase 7: Convergence

- [X] T018 Atualizar "Performance Goals" em `specs/007-page-transition-animations/plan.md` para refletir o SC-003 ajustado (200–500 ms em iOS/web; ~150 ms aceito no Android) per plan: Technical Context / SC-003 (partial)
