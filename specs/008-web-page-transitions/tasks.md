---

description: "Lista de tarefas: Transições entre Telas na Web"
---

# Tasks: Transições entre Telas na Web

**Input**: Documentos de design em `/specs/008-web-page-transitions/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/web-transitions.md, quickstart.md (data-model.md não define campos restritos)

**Tests**: Não solicitados. O app não tem framework de testes; a validação é manual no navegador via [quickstart.md](quickstart.md), mais checagem de tipos e lint.

**Organization**: Tarefas agrupadas por história de usuário. Todos os caminhos são relativos à raiz do repositório; escopo só em `app/`. Cada módulo novo tem versão móvel sem efeito (`.ts`/`.tsx`) e versão `.web`, para não alterar o comportamento móvel (FR-011).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: história de usuário a que pertence (US1, US2)

## Phase 1: Setup

- [ ] T001 Consultar a documentação do Expo v57 (https://docs.expo.dev/versions/v57.0.0/) sobre a saída web e a API *View Transitions* (MDN) antes de codar, conforme `app/AGENTS.md`; rodar `yarn web` em `app/` para confirmar o app abrindo no navegador como linha de base

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: módulo de view transitions, usado pelas duas histórias

**⚠️ CRITICAL**: nenhuma história começa antes desta fase

- [X] T002 Criar `app/src/shared/navigation/view-transition.ts` (versão móvel sem efeito) conforme [contracts/web-transitions.md](contracts/web-transitions.md): `runWithViewTransition(update, options?)` que só executa `update`, `useViewTransitionActive()` que devolve `false` e `useProfessionalTransitionName(id)` que devolve `undefined`
- [X] T003 Criar `app/src/shared/navigation/view-transition.web.ts` com a mesma interface: `runWithViewTransition` usa `document.startViewTransition` quando houver suporte e `prefers-reduced-motion` não for `reduce`, resolve quando o foco da tela mudar com limite de 400 ms, ignora nova transição enquanto outra estiver ativa e usa `skipTransition()` se necessário; guarda o id do profissional em navegação para `useProfessionalTransitionName`; sem suporte apenas executa `update` (FR-007, FR-008, FR-009)

**Checkpoint**: módulo pronto, sem uso ainda

---

## Phase 3: User Story 1 - Fade through em todas as navegações na web (Priority: P1) 🎯 MVP

**Goal**: toda navegação na versão web esmaece a nova tela, inclusive voltar/avançar do navegador e troca de abas.

**Independent Test**: cenários 1, 2, 5, 7 e 8 do [quickstart.md](quickstart.md).

- [X] T004 [P] [US1] Criar `app/src/shared/navigation/web-screen-fade.tsx` (versão móvel): componente `ScreenFade` que devolve os filhos sem alteração
- [X] T005 [US1] Criar `app/src/shared/navigation/web-screen-fade.web.tsx`: `ScreenFade` com `useIsFocused` e Reanimated (`useSharedValue`/`withTiming`), opacidade 0→1 em ~250 ms com atraso de 60 ms ao ganhar foco; sem animação quando `useReducedMotion()` for verdadeiro ou `useViewTransitionActive()` for verdadeiro (FR-001, FR-008, plan: interação entre camadas)
- [X] T006 [P] [US1] Aplicar `screenLayout` com `ScreenFade` na pilha raiz em `app/src/app/_layout.tsx` (FR-001)
- [X] T007 [P] [US1] Aplicar `screenLayout` com `ScreenFade` na pilha de autenticação em `app/src/app/(auth)/_layout.tsx` (FR-001)
- [X] T008 [P] [US1] Aplicar `screenLayout` com `ScreenFade` na pilha autenticada em `app/src/app/(app)/(authenticated)/_layout.tsx` (FR-001)
- [X] T009 [US1] Verificar em `app/src/app/(app)/(authenticated)/(home)/_layout.tsx` que `useTabTransition()` produz fade nas abas na web (o navegador de abas em JavaScript já suporta `animation: "fade"`); ajustar só se não animar (US1 cenário 3)

**Checkpoint**: Fade through funciona na web em todas as navegações; demonstrável sozinho

---

## Phase 4: User Story 2 - Hero ao escolher um profissional na web (Priority: P2)

**Goal**: o card do profissional escolhido se expande até o cabeçalho do agendamento e retorna ao voltar, na web.

**Independent Test**: cenários 3, 4, 5, 6 e 8 do [quickstart.md](quickstart.md).

- [X] T010 [US2] Em `app/src/features/appointments/components/employees-card.tsx`, aplicar o nome `view-transition-name` retornado por `useProfessionalTransitionName(props.id)` ao card, via referência ao elemento DOM, somente na web, mantendo a tag do Reanimated para o móvel (FR-002, FR-004)
- [X] T011 [US2] Em `app/src/features/appointments/screens/appointments-view.tsx`, envolver o `router.push` do card com `runWithViewTransition`, passando o id do profissional, mantendo o bloqueio de toque duplo existente (FR-002, FR-009)
- [X] T012 [US2] Em `app/src/features/appointments/screens/appointments-create.tsx`, substituir o botão voltar do cabeçalho por um que chame `router.back` dentro de `runWithViewTransition` com o id do profissional, mantendo título e aparência atuais (FR-003)
- [X] T013 [US2] Em `app/src/shared/navigation/view-transition.web.ts`, registrar no carregamento do módulo um ouvinte de `popstate` (antes do roteador) que inicia a view transition para voltar/avançar do navegador entre lista e agendamento, com a mesma alternativa e limite de 400 ms (FR-005, research: risco de ordem dos ouvintes)
- [X] T014 [US2] Garantir que abrir ou recarregar direto na tela de agendamento carrega sem erro nem Hero: nenhum código do módulo deve assumir navegação de origem (FR-006)

**Checkpoint**: Hero funciona na web, com Fade through como alternativa

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T015 Rodar `npx tsc --noEmit` e `npx eslint src --quiet` em `app/` e corrigir erros introduzidos
- [ ] T016 Executar os cenários 1–9 e 11 do [quickstart.md](quickstart.md) no Chrome/Edge; repetir 1, 3 e 6 em Firefox e Safari (SC-004)
- [X] T017 Confirmar o cenário 10 (móvel intacto): conferir que nenhum arquivo móvel mudou de comportamento e, havendo dispositivo, repetir o cenário 3 da feature 007 (FR-011, SC-007)
- [ ] T018 Registrar em `specs/008-web-page-transitions/research.md` qualquer limitação encontrada (por exemplo, voltar/avançar do navegador sem Hero em algum navegador) e o comportamento alternativo adotado

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → US1 e US2 → Polish.
- T002 antes de T003; T003 antes de T005 (hook de transição ativa), T010–T013.
- US1: T004 antes de T006–T008 (importam `ScreenFade`); T005 antes de T006–T008 para validar; T006–T008 em paralelo; T009 depois.
- US2: T010 e T011 podem andar juntas após T003; T012 depois de T011; T013 altera o mesmo arquivo de T003, então roda depois dele; T014 por último.
- US1 e US2 são independentes entre si após a Phase 2, exceto pela leitura de `useViewTransitionActive` em T005.

## Parallel Example

```text
Após T003: T004 (US1) em paralelo com T010 e T011 (US2)
Depois de T005: T006, T007 e T008 em paralelo
```

## Implementation Strategy

- **MVP**: Phases 1–3 (Fade through na web). Já resolve o "não funciona na web" para todas as telas.
- **Incremental**: acrescentar o Hero (US2) e depois Polish.
- Como o Hero depende de API do navegador e de capturar `popstate`, validar T013 no navegador (T016) assim que existir.

---

## Phase 6: Convergence

- [X] T019 Em `app/src/shared/navigation/view-transition.web.ts`, limitar a view transition de `popstate` ao fluxo profissional → agendamento (zerar `lastProfessionalId` ao sair desse fluxo ou comparar a rota de destino) e implementar o `skipTransition()` descrito em T003 quando a transição ficar sem resolução, para que voltar/avançar em outras telas nunca espere os 400 ms per FR-009 / SC-005 (partial)
