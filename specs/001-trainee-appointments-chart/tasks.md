---

description: "Tasks for Gráfico de Agendamentos do Estagiário"
---

# Tasks: Gráfico de Agendamentos do Estagiário

**Input**: Design documents from `/specs/001-trainee-appointments-chart/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/trainee-appointments-monthly.md, quickstart.md

**Tests**: Incluídos para o servidor (Vitest), exigidos pela Constituição (Princípio V) e previstos no plano. A plataforma não tem runner de testes; sua verificação é `yarn build`, `yarn lint` e o roteiro do quickstart.

**Organization**: Tarefas agrupadas por história de usuário.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: história de usuário da spec (US1, US2, US3)

## Path Conventions

- API: `server/src/appointments/`
- Plataforma: `platform/src/features/`

---

## Phase 1: Setup

**Purpose**: Garantir uma base verde antes de alterar código (sem schema nem dependência nova)

- [X] T001 Rodar `yarn test` e `yarn lint` em `server/` e `yarn build` e `yarn lint` em `platform/` para registrar o estado inicial

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Autorização e tipos compartilhados que as três histórias usam

**⚠️ CRITICAL**: Nenhuma história começa antes desta fase

- [X] T002 Adicionar a regra `viewProfessionalStats` (somente `Role.COORDINATOR`) em `server/src/appointments/appointments.policy.ts`
- [X] T003 [P] Escrever teste Vitest da policy (coordenador permitido; professor, recepcionista, estagiário, paciente e `null` negados) em `server/src/appointments/appointments.policy.spec.ts`
- [X] T004 [P] Criar o DTO de resposta `MonthlyCountDto` (`month` e `count`, com `@ApiProperty`) em `server/src/appointments/dto/monthly-count.dto.ts`, conforme `MonthlyAppointmentCount.month` e `MonthlyAppointmentCount.count` de `data-model.md`
- [X] T005 [P] Adicionar o tipo `MonthlyAppointmentCount` e o método `monthlyByProfessional(professionalId)` (GET `/appointments/professionals/:professionalId/monthly-count`) em `platform/src/features/appointments/services/appointments.service.ts`

**Checkpoint**: policy, DTO e cliente HTTP prontos

---

## Phase 3: User Story 1 - Ver a carga de atendimentos de um estagiário (Priority: P1) 🎯 MVP

**Goal**: Ao selecionar um estagiário, exibir um gráfico de barras com os agendamentos por mês (6 meses) em que ele é o profissional.

**Independent Test**: Selecionar um estagiário com agendamentos em meses diferentes e conferir que cada barra tem a contagem correta; trocar de estagiário e ver o gráfico mudar (quickstart, passos 2 a 4 e 7).

### Tests for User Story 1

> Escrever primeiro e confirmar que falham antes da implementação

- [X] T006 [US1] Escrever teste Vitest de `countByMonthForProfessional` em `server/src/appointments/appointments.service.spec.ts`: retorna exatamente 6 itens em ordem crescente, preenche meses vazios com 0, agrupa pelo mês de `Appointment.initialDate` no fuso `America/Bahia` (borda de mês, ex.: 30/11 às 23:30 conta em novembro e 01/12 às 00:30 conta em dezembro), conta só agendamentos com o estagiário como `professional` e lança `NotFoundException` se o usuário não existir ou não for `trainee`

### Implementation for User Story 1

- [X] T007 [US1] Implementar `countByMonthForProfessional(professionalId)` em `server/src/appointments/appointments.service.ts`: validar que o usuário existe e é `Role.TRAINEE` (404 caso contrário), consultar a contagem mensal agregada com `createQueryBuilder` e `GROUP BY date_trunc('month', "initialDate" AT TIME ZONE 'America/Bahia')` filtrando por `professional.id` e `Appointment.initialDate` dentro da janela, e preencher com zero os meses sem registro (depende de T004 e T006)
- [X] T008 [US1] Adicionar a rota `GET professionals/:professionalId/monthly-count` em `server/src/appointments/appointments.controller.ts`, com `@Can(AppointmentsPolicy, 'viewProfessionalStats')`, `ParseIntPipe` e `@ApiOkResponse`; declarar ANTES de `@Get(':id')` (depende de T002, T007)
- [X] T009 [P] [US1] Criar o componente `TraineeAppointmentsChart({ traineeId })` em `platform/src/features/users/components/TraineeAppointmentsChart.tsx`: `useQuery` com chave `['appointments', 'monthly', traineeId]`, título "Agendamentos por mês", subtítulo "Últimos 6 meses", uma barra SVG por mês com altura proporcional à contagem, eixo X em pt-BR abreviado (ex.: "nov/26"), escala automática do eixo Y (inclusive para volumes altos) e estado de carregamento com `LoadingSpinner` (depende de T005)
- [X] T010 [US1] Renderizar `TraineeAppointmentsChart` em `UserDetail` de `platform/src/features/users/screens/UsersPage.tsx` somente quando `user.role === 'trainee'` e o usuário logado (via `useAuth` de `platform/src/features/auth/contexts/auth.tsx`) é `coordinator`; para os demais perfis nada é renderizado (depende de T009)

**Checkpoint**: o gráfico de barras aparece e funciona para o coordenador; o endpoint nega os demais perfis e a tela oculta o gráfico para eles

---

## Phase 4: User Story 2 - Entender os valores do gráfico (Priority: P2)

**Goal**: O usuário vê o mês e o valor exato de cada barra e o gráfico é legível por tecnologias assistivas.

**Independent Test**: Passar o cursor ou focar uma barra e ver mês e quantidade exata (quickstart, passo 3).

### Implementation for User Story 2

- [X] T011 [US2] Em `platform/src/features/users/components/TraineeAppointmentsChart.tsx`, exibir o valor numérico acima de cada barra e um tooltip por barra (`<title>` do SVG) com mês por extenso e contagem exata ("novembro de 2026: 4 agendamentos"), também acessível por foco de teclado (`tabIndex={0}`)
- [X] T012 [US2] Em `platform/src/features/users/components/TraineeAppointmentsChart.tsx`, adicionar `role="img"` com `aria-label` resumindo o gráfico e uma lista visualmente oculta (`sr-only`) com mês e contagem de cada barra

**Checkpoint**: valores exatos acessíveis por mouse, teclado e leitor de tela

---

## Phase 5: User Story 3 - Estados sem dados ou com erro (Priority: P3)

**Goal**: Mensagens claras quando não há agendamentos ou o carregamento falha.

**Independent Test**: Selecionar estagiário sem agendamentos e simular falha da API (quickstart, passos 5 e 6).

### Implementation for User Story 3

- [X] T013 [P] [US3] Em `platform/src/features/users/components/TraineeAppointmentsChart.tsx`, tratar o estado vazio (todas as contagens 0): exibir `EmptyState` com "Nenhum agendamento nos últimos 6 meses" no lugar das barras
- [X] T014 [US3] Em `platform/src/features/users/components/TraineeAppointmentsChart.tsx`, tratar o estado de erro da consulta com a mensagem "Não foi possível carregar o gráfico", isolado do restante do detalhe do usuário (mesmo estilo do aviso de erro de `UsersPage.tsx`)

**Checkpoint**: todas as histórias funcionam de forma independente

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T015 [P] Conferir que a resposta do endpoint traz apenas `month` e `count` (sem dados de paciente, nota ou criador) e que a documentação Swagger em `http://localhost:3000/api` mostra a nova rota
- [X] T016 Rodar `yarn test` e `yarn lint` em `server/` e `yarn build` e `yarn lint` em `platform/`, sem erros — servidor: testes (13) e tsc OK, lint com 1 erro anterior em `src/auth/auth.service.ts:270`; plataforma: `yarn build` OK, mas `yarn lint` não roda porque `eslint` não está instalado em `platform/` (anterior a esta feature)
- [ ] T017 Executar o roteiro completo de `specs/001-trainee-appointments-chart/quickstart.md`, incluindo o 403 para professor, recepcionista, estagiário e paciente, a ausência do gráfico para recepcionista, a troca rápida entre estagiários e o tempo de exibição de até 2 s (SC-001) — PENDENTE: lado da API verificado (200 para coordenador, 403 para professor/recepcionista/estagiário/paciente, 400 e 404); passos visuais na tela (2 a 7) ainda não executados

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: depende de T001; bloqueia as histórias
- **US1 (Phase 3)**: depende da Phase 2
- **US2 (Phase 4)** e **US3 (Phase 5)**: dependem de T009 (o componente criado em US1); editam o mesmo arquivo, então rodam em sequência, não em paralelo
- **Polish (Phase 6)**: depende das histórias desejadas

### Within User Story 1

- T006 (teste) antes de T007 (implementação)
- T007 → T008 (rota usa o serviço)
- T009 (frontend) pode andar em paralelo com T006–T008, pois depende só de T005
- T010 depende de T009

### Parallel Opportunities

- T003, T004 e T005 em paralelo (arquivos diferentes)
- Backend (T006–T008) e frontend (T009) de US1 em paralelo

---

## Parallel Example: Foundational e User Story 1

```text
# Fase 2, juntas:
T003 policy.spec.ts | T004 monthly-count.dto.ts | T005 appointments.service.ts (plataforma)

# US1, em duas frentes:
Backend:  T006 → T007 → T008
Frontend: T009 → T010
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 e Phase 2
2. Phase 3 (US1)
3. **PARAR e VALIDAR**: quickstart passos 2, 4, 7 e 8
4. Demonstrar

### Incremental Delivery

1. Base pronta (Phases 1–2)
2. US1: gráfico funcional (MVP)
3. US2: valores exatos e acessibilidade
4. US3: estados vazio e erro
5. Polish: validação final

---

## Notes

- Sem migration e sem dependência nova (decisões em `research.md`)
- O app móvel não é alterado
- Todos os textos em português do Brasil (Constituição)
- Commit por tarefa ou grupo lógico
