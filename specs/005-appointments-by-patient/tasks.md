---

description: "Task list for Agendamentos Agrupados por Paciente"
---

# Tasks: Agendamentos Agrupados por Paciente

**Input**: Design documents from `/specs/005-appointments-by-patient/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/appointments-ui-api.md, quickstart.md

**Tests**: A spec não pede TDD. Inclui-se apenas o teste Vitest do servidor exigido pela constituição para o endpoint novo (T003). O `platform/` não tem framework de testes; validação por [quickstart.md](quickstart.md) e `yarn build`.

**Organization**: Tarefas agrupadas por user story. Sem novas dependências e sem migração. Padrão de referência: feature 004 (`platform/src/features/surveys/*`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: US1 (lista por paciente), US2 (perfil/histórico), US3 (filtros)

## Phase 1: Setup

Nenhuma tarefa: não há dependências novas nem estrutura nova a inicializar.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Endpoint de lista completa, tipos e lógica pura de agrupamento/filtro usados pelas três histórias

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase.

- [x] T001 [P] Em `server/src/appointments/appointments.service.ts`, extrair a consulta de `findAll` para um método privado que aceita limite opcional (mesmo `select`, relações, ordenação por `initialDate` DESC e escopo por papel: paciente só os próprios); `findAll(user)` continua passando `take: 5` e um novo `findAllUnlimited(user)` chama a mesma consulta sem limite (research.md D1)
- [x] T002 Em `server/src/appointments/appointments.controller.ts`, adicionar `@Get('all')` com `@Can(AppointmentsPolicy, 'view')` e `@ApiOkResponse` chamando `findAllUnlimited(user)`, declarado **antes** de `@Get(':id')` (research.md D2; [contracts/appointments-ui-api.md](contracts/appointments-ui-api.md)); sem alterar `GET /appointments` (depende de T001)
- [x] T003 Estender `server/src/appointments/appointments.service.spec.ts` (`findAllUnlimited` não aplica limite e `findAll` mantém `take: 5`; paciente só consulta os próprios agendamentos) e `server/src/appointments/appointments.controller.spec.ts` (`GET /appointments/all` responde 200 para os papéis permitidos e delega a `findAllUnlimited`; não é capturado por `:id`), seguindo o padrão existente nesses arquivos (depende de T001, T002)
- [x] T004 [P] Criar `platform/src/shared/utils/dateRange.ts` exportando `toLocalDateKey(iso)` e `isDateRangeValid(from, to)` (mesma lógica hoje em `platform/src/features/surveys/utils/patientSurveys.ts`, research.md D8) e fazer `patientSurveys.ts` importá-las de lá, mantendo suas exportações atuais para não quebrar `SurveysPage.tsx` e `PatientSurveyFilters.tsx`
- [x] T005 [P] Em `platform/src/features/appointments/services/appointments.service.ts`, adicionar `professional` ao tipo `Appointment` (`Appointment.professional` em [data-model.md](data-model.md), mantendo `therapist` por compatibilidade) e o método `listAll()` que chama `GET /appointments/all` e devolve `[]` se a resposta não for array (como `list`)
- [x] T006 Criar `platform/src/features/appointments/utils/patientAppointments.ts` com funções puras tipadas: `groupByPatient(appointments)` → `PatientAppointmentSummary[]` (`PatientAppointmentSummary.patientId`, `.displayName`, `.email`, `.appointmentCount`, `.lastAppointmentAt`, `.appointments`; ordenação conforme [data-model.md](data-model.md)); `searchPatients(summaries, query)`; `getProfessionalOptions(appointments)` → `ProfessionalOption[]` (`ProfessionalOption.id`, `.label`; lê `professional ?? therapist`); `hasActiveFilters`; `filterAppointments(appointments, filters)` aplicando `PatientAppointmentFilters.from`, `.to` (de `initialDate`, via `dateRange.ts`) e `.professionalId`, com E lógico e ignorando o intervalo quando inválido; exportar `EMPTY_FILTERS` (depende de T004, T005)

**Checkpoint**: contrato e utilitários prontos.

---

## Phase 3: User Story 1 - Lista de pacientes (Priority: P1) 🎯 MVP

**Goal**: A página de Agendamentos lista pacientes (uma linha por pessoa) em vez de agendamentos por data, com contagem completa.

**Independent Test**: Cenários 1 e 2 do [quickstart.md](quickstart.md): cada paciente uma única vez, "N agendamentos" correto (inclusive 6+), "Último: <data>", ordem pela mais recente, busca funcional, vazio com mensagem.

- [x] T007 [US1] Reescrever `platform/src/features/appointments/components/AppointmentsList.tsx` para listar `PatientAppointmentSummary` usando `appointmentsService.listAll()` (queryKey `['appointments', 'all']`, research.md D9) com `groupByPatient`/`searchPatients`: nome (ou e-mail), "N agendamentos", "Último: <data>" via `formatDate` de `platform/src/shared/utils/formatDate.ts`; item ativo quando a rota é `/appointments/patient/<id>`; estados de carregamento, erro com "Tentar novamente" (`refetch`) e vazio ("Nenhum agendamento encontrado"); `onSelect` recebe `patientId`
- [x] T008 [P] [US1] Em `platform/src/router.tsx`, adicionar a rota `appointments/patient/:patientId` para `AppointmentsPage`, mantendo `appointments` e `appointments/:id` (FR-015)
- [x] T009 [US1] Em `platform/src/shared/components/layout/SectionPanel.tsx`, trocar o `onSelect` da seção `appointments` para `navigate(`/appointments/patient/${patientId}`)` (depende de T007)
- [x] T010 [US1] Em `platform/src/features/appointments/screens/AppointmentsPage.tsx`, atualizar o estado sem seleção para "Selecione um paciente" / "Escolha um paciente na lista à esquerda para ver seus agendamentos, ou crie um novo." e o título do cabeçalho para "Agendamentos" também quando há paciente selecionado

**Checkpoint**: US1 funcional (a seleção ainda não abre o perfil completo).

---

## Phase 4: User Story 2 - Perfil e histórico do paciente (Priority: P1)

**Goal**: Ao selecionar um paciente, o painel direito mostra identificação e histórico de todos os agendamentos; abrir um agendamento mostra o detalhe existente.

**Independent Test**: Cenários 3, 8 e 9 do [quickstart.md](quickstart.md).

- [x] T011 [US2] Em `platform/src/features/appointments/screens/AppointmentsPage.tsx`, criar `PatientProfile` (rota `appointments/patient/:patientId`): cabeçalho com `Avatar`, nome/e-mail e total de agendamentos; histórico do mais recente ao mais antigo com data, horário (reaproveitando `formatAppointmentTime`) e profissional (`professional ?? therapist`, ou "Profissional não informado"); selecionar um item define `?appointment=<id>` e exibe o `AppointmentDetail` existente (com `canEdit`/cancelar como hoje); sem parâmetro, abre o mais recente; paciente com um único agendamento funciona (FR-006, FR-007)
- [x] T012 [US2] No `AppointmentDetail` de `platform/src/features/appointments/screens/AppointmentsPage.tsx`, ler o profissional de `appointment.professional ?? appointment.therapist` e trocar o rótulo "Terapeuta" por "Profissional" (research.md D5) (depende de T011)
- [x] T013 [US2] Em `platform/src/features/appointments/screens/AppointmentsPage.tsx`, tratar a rota legada `appointments/:id` (FR-015): buscar `listAll` (queryKey `['appointments', 'all']`), localizar o agendamento `id` e redirecionar (`replace`) para `/appointments/patient/<patientId>?appointment=<id>`; id inexistente mostra "Agendamento não encontrado"; manter `createMutation` navegando para `/appointments/<id>` e as mutations invalidando `['appointments']` (FR-013, research.md D6/D7) (depende de T011)
- [x] T014 [US2] Em `platform/src/features/appointments/screens/AppointmentsPage.tsx`, garantir estados de carregamento, erro ("Erro ao carregar agendamentos." com "Tentar novamente") e paciente inexistente ("Paciente não encontrado") no perfil (FR-012)

**Checkpoint**: US1 + US2 entregam a visão por pessoa completa.

---

## Phase 5: User Story 3 - Filtros de período e profissional (Priority: P2)

**Goal**: No perfil, filtrar o histórico por intervalo de datas e profissional.

**Independent Test**: Cenários 4 a 7 do [quickstart.md](quickstart.md).

- [x] T015 [P] [US3] Criar `platform/src/features/appointments/components/PatientAppointmentFilters.tsx` seguindo `platform/src/features/surveys/components/PatientSurveyFilters.tsx`: campos "De" e "Até" (`Input`; `PatientAppointmentFilters.from`, `.to`), seletor "Profissional" com "Todos" + `ProfessionalOption` recebidas por prop (`PatientAppointmentFilters.professionalId`), "Limpar filtros" e aviso "A data inicial não pode ser posterior à final." quando `isDateRangeValid` for falso (FR-008, FR-009, FR-010, FR-011)
- [x] T016 [US3] Integrar em `PatientProfile` (`platform/src/features/appointments/screens/AppointmentsPage.tsx`): estado dos filtros local ao perfil, reiniciado por `key={patientId}`; opções por `getProfessionalOptions`; histórico usa `filterAppointments` com atualização imediata (depende de T011, T015)
- [x] T017 [US3] Em `PatientProfile`, quando `filterAppointments` retornar vazio com filtros ativos, mostrar "Nenhum agendamento encontrado para os filtros selecionados" com ação "Limpar filtros"; se o agendamento aberto sair do conjunto filtrado, abrir o primeiro do resultado (depende de T016)

**Checkpoint**: todas as histórias funcionais.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T018 [P] Rodar `yarn test src/appointments` em `server/` e `yarn build` em `platform/`; confirmar que o build da feature 004 (`SurveysPage`) segue sem erro após T004
- [x] T019 Confirmar a ausência de regressão (FR-016): `GET /appointments` continua com `take: 5` (teste de T003), `DashboardPage.tsx` continua usando `appointmentsService.list()` sem mudança e o app móvel não foi tocado
- [ ] T020 Executar os cenários de [quickstart.md](quickstart.md) no navegador (incluindo papéis; lembrar que "Cancelar Agendamento" não persiste hoje, research.md D6)

---

## Dependencies & Execution Order

- Foundational (T001–T006) bloqueia as histórias. T002 depende de T001; T003 de T001/T002; T006 de T004 e T005; T001, T004 e T005 são independentes entre si.
- US1 (T007–T010) → MVP. T009 depende de T007; T008 e T010 independentes.
- US2 (T011–T014) depende de US1 e de T005/T006; T012 e T013 dependem de T011 (mesmo arquivo: executar em ordem).
- US3 (T015–T017) depende de US2; T015 pode ser feito em paralelo com US1/US2.
- Polish após as histórias.

## Parallel Examples

- Foundational: T001 ‖ T004 ‖ T005 (depois T002, T003, T006).
- US1: T008 ‖ T010 enquanto T007 é feito.
- US3: T015 em paralelo com T011–T014.

## Implementation Strategy

1. **MVP**: Foundational + US1 (lista por paciente com contagem completa).
2. **Incremento 1**: US2 completa perfil, histórico, rota legada e correção do rótulo do profissional.
3. **Incremento 2**: US3 adiciona os filtros.
4. Polish e validação pelo quickstart.

## Notes

- Total: 20 tarefas (Foundational 6, US1 4, US2 4, US3 3, Polish 3).
- `AppointmentsPage.tsx` é editado por várias tarefas (T010–T014, T016–T017): executar em ordem.
- Fora de escopo: persistência do cancelamento (`AppointmentsService.update` é stub) e `@Can` em `GET /appointments/:id`.
