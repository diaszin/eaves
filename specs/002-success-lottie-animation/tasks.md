---

description: "Task list for success-lottie-animation"
---

# Tasks: Animação de sucesso no painel de confirmação

**Input**: Design documents from `/specs/002-success-lottie-animation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/success-bottom-sheet.md, quickstart.md

**Tests**: Não solicitados na especificação e o app não possui framework de testes; a validação é manual (ver quickstart.md) mais lint e `tsc`.

**Organization**: Uma única user story (US1), por isso as fases de Setup e Polish envolvem a dependência e a verificação.

## Format: `[ID] [P?] [Story] Description`

## Path Conventions

- App Expo: `app/` (código em `app/src/`, assets em `app/assets/`)

---

## Phase 1: Setup

- [X] T001 Consultar as docs do Expo SDK 57 sobre Lottie (https://docs.expo.dev/versions/v57.0.0/sdk/lottie/) e instalar a dependência com `npx expo install lottie-react-native` em `app/`, confirmando que `app/package.json` passou a listar `lottie-react-native` na versão ~7.3.8

---

## Phase 2: Foundational

Sem tarefas bloqueantes além do Setup.

---

## Phase 3: User Story 1 - Ver animação de sucesso ao concluir uma ação (Priority: P1) 🎯 MVP

**Goal**: Substituir o ícone estático do painel de sucesso pela animação `success.json`, tocando uma vez e reiniciando a cada abertura.

**Independent Test**: Abrir o painel com uma mensagem qualquer; a animação aparece no lugar do ícone, com a mensagem e "Feito com sucesso !" visíveis; fechar e reabrir reinicia a animação (cenários 1 a 5 de [quickstart.md](quickstart.md)).

### Implementation for User Story 1

- [X] T002 [US1] Em `app/src/components/SuccesssBottomSheet.tsx`, remover o import `MdCheckCircle` de `react-icons/md` e o elemento que o renderiza (FR-002), e importar `LottieView` de `lottie-react-native`
- [X] T003 [US1] Em `app/src/components/SuccesssBottomSheet.tsx`, renderizar `LottieView` com `source={require("../../assets/animations/json/success.json")}`, `autoPlay`, `loop={false}` no lugar do ícone, dentro de uma caixa quadrada de ~96–120px (estilo `width`/`height`), mantendo a altura do painel sem cortes (FR-001, FR-003, FR-007; ver research.md decisões 2 e 4)
- [X] T004 [US1] Em `app/src/components/SuccesssBottomSheet.tsx`, garantir que a animação reinicia a cada abertura: renderizá-la somente quando `props.isOpen` for `true` (ou usar `key` que muda por abertura; se não bastar, `ref.reset()` + `ref.play()` ao abrir) (FR-004; research.md decisão 3)
- [X] T005 [US1] Em `app/src/components/SuccesssBottomSheet.tsx`, conferir que mensagem, texto "Feito com sucesso !", `onDismiss` e as props (`messsage`, `isOpen`, `onDismiss`) permanecem inalterados (FR-005, FR-006; contracts/success-bottom-sheet.md) e que falha de carregamento da animação não exibe erro nem remove os textos (FR-008)

**Checkpoint**: O painel exibe a animação em todas as telas consumidoras sem alterar o uso.

---

## Phase 4: Polish & Verificação

- [X] T006 Executar `yarn lint` e `npx tsc --noEmit` em `app/` e corrigir erros introduzidos por esta mudança
- [ ] T007 Validar manualmente os cenários de [quickstart.md](quickstart.md) em uma tela consumidora (por exemplo `app/src/features/appointments/screens/appointments-create.tsx`): animação única, reinício na reabertura, modo claro/escuro, mensagem longa e plataforma web; ajustar o tamanho em `app/src/components/SuccesssBottomSheet.tsx` se houver corte ou sobreposição

---

## Dependencies & Execution Order

- T001 (Setup) bloqueia T002–T005.
- T002 → T003 → T004 → T005 (mesmo arquivo, execução sequencial; nenhuma tarefa paralelizável).
- T006 e T007 dependem de T005.

## Implementation Strategy

MVP = User Story 1 inteira (T001–T005), seguida da verificação (T006–T007). Como todas as tarefas de código editam o mesmo arquivo, a execução é sequencial.
