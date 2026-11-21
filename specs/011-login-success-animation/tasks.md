---

description: "Task list for login-success-animation"
---

# Tasks: Animação de sucesso no botão de login

**Input**: Design documents from `/specs/011-login-success-animation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/button-success-check.md, quickstart.md

**Tests**: Não solicitados na especificação e o app não possui framework de testes; a validação é manual (ver quickstart.md) mais lint e `tsc`.

**Organization**: Tarefas agrupadas por user story. US1 (botão "Entrar") entrega o valor principal; US2 (Microsoft) reutiliza o componente da US1.

## Format: `[ID] [P?] [Story] Description`

## Path Conventions

- App Expo: `app/` (código em `app/src/`, assets em `app/assets/`)

---

## Phase 1: Setup

- [X] T001 Consultar as docs do Expo SDK 57 sobre Lottie (https://docs.expo.dev/versions/v57.0.0/sdk/lottie/) e confirmar a assinatura de `onAnimationFinish`, `autoPlay` e `loop` do `lottie-react-native` ~7.3.8 já listado em `app/package.json` (sem instalar nada novo); anotar qualquer diferença de comportamento na web

---

## Phase 2: Foundational

Sem tarefas bloqueantes além do Setup.

---

## Phase 3: User Story 1 - Ver a confirmação animada dentro do botão "Entrar" (Priority: P1) 🎯 MVP

**Goal**: Após login por e-mail/senha aceito, mostrar a animação de check dentro do botão "Entrar" (fundo verde, mesmas dimensões) e só então redirecionar.

**Independent Test**: Cenários 1, 2, 3, 6, 7 e 8 de [quickstart.md](specs/011-login-success-animation/quickstart.md).

- [X] T002 [US1] Criar o componente `ButtonSuccessCheck` em `app/src/shared/components/button-success-check.tsx` conforme [contracts/button-success-check.md](specs/011-login-success-animation/contracts/button-success-check.md): `LottieView` com `source={require("../../../assets/animations/json/check-mark.json")}`, `autoPlay`, `loop={false}`, caixa `size` x `size` (padrão 40); `onFinish` disparado por `onAnimationFinish` (ignorar `isCancelled`) ou por tempo limite de 3500 ms, uma única vez (guarda com `useRef`), com `clearTimeout` na desmontagem (decisões 2 e 6 de [research.md](specs/011-login-success-animation/research.md))
- [X] T003 [US1] Em `app/src/features/auth/screens/login.tsx`, adicionar o estado `successButton: "email" | "microsoft" | null` ([data-model.md](specs/011-login-success-animation/data-model.md)) e alterar o `onSuccess` da mutation `mutate` para `await signIn(...)` seguido de `setSuccessButton("email")`, removendo o `router.replace("/")` desse ponto
- [X] T004 [US1] Em `app/src/features/auth/screens/login.tsx`, no botão "Entrar" (`PressableScale` do `authForm.Subscribe`): quando `successButton === "email"`, renderizar `<ButtonSuccessCheck onFinish={() => router.replace("/")} />` no lugar do texto/ícone/`ActivityIndicator`, aplicar fundo verde `#00C885` (mantendo `min-h-12`) e incluir `successButton !== null` nas condições de `disabled` (FR-001, FR-002, FR-002a, FR-004, FR-005)

**Checkpoint**: login por e-mail/senha mostra a animação no botão e redireciona só ao final; login recusado mantém o comportamento atual.

---

## Phase 4: User Story 2 - Mesmo comportamento no login com Microsoft (Priority: P2)

**Goal**: Aplicar a mesma animação e regra de redirecionamento ao botão "Continuar com Microsoft" para contas já cadastradas.

**Independent Test**: Cenários 4 e 5 de [quickstart.md](specs/011-login-success-animation/quickstart.md).

- [X] T005 [US2] Em `app/src/features/auth/screens/login.tsx`, alterar o `onSuccess` de `microsoftMutation` para, quando `data` existir, `await signIn(...)` e `setSuccessButton("microsoft")` (sem `router.replace`); manter inalterado o ramo sem `data` (encaminhamento ao cadastro, sem animação)
- [X] T006 [US2] Em `app/src/features/auth/screens/login.tsx`, no botão "Continuar com Microsoft": quando `successButton === "microsoft"`, renderizar `<ButtonSuccessCheck onFinish={() => router.replace("/")} />` no lugar do conteúdo, fundo verde `#00C885` sem a borda cinza, e incluir `successButton !== null` no `disabled` (FR-007)

**Checkpoint**: ambos os botões exibem a animação; nenhum tem dois redirecionamentos.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T007 Rodar `yarn lint` e `npx tsc --noEmit` em `app/` e corrigir apenas problemas introduzidos por esta feature em `app/src/shared/components/button-success-check.tsx` e `app/src/features/auth/screens/login.tsx`
- [ ] T008 Executar os 8 cenários manuais de [quickstart.md](specs/011-login-success-animation/quickstart.md) na web e em um dispositivo/emulador, conferindo SC-001 a SC-005, e registrar divergências

---

## Dependencies & Execution Order

- T001 → T002 (assinatura da API confirmada antes de usar).
- T002 → T004 e T006 (componente necessário nos botões).
- T003 → T004; T005 → T006 (estado e `onSuccess` antes da renderização).
- T003, T004, T005 e T006 editam o mesmo arquivo (`login.tsx`), logo são sequenciais.
- US2 depende do componente e do estado criados na US1 (T002, T003), mas pode ser validada de forma independente.
- T007 e T008 após T006.

### Parallel Opportunities

Poucas: o único arquivo novo (T002) pode ser escrito em paralelo com T003, pois ambos só dependem de T001/estado definido em [data-model.md](specs/011-login-success-animation/data-model.md).

```text
T001 → [T002 ∥ T003] → T004 → T005 → T006 → [T007, T008]
```

## Implementation Strategy

- **MVP**: Phase 1 + Phase 3 (US1). Já entrega a animação e o redirecionamento adiado no botão "Entrar".
- **Incremental**: depois adicionar US2 (Microsoft) e finalizar com lint, `tsc` e validação manual.
