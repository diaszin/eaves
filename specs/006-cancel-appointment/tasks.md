---

description: "Task list for Cancelar Agendamento"
---

# Tasks: Cancelar Agendamento

**Input**: Design documents from `/specs/006-cancel-appointment/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cancel-appointment-api.md, quickstart.md

**Tests**: A spec não pede TDD. Inclui-se o teste Vitest do servidor exigido pela constituição para a mudança de comportamento da API (T006, T009, T013). `platform/` e `app/` não têm framework de testes; validação por [quickstart.md](quickstart.md), `yarn build` (platform) e `npx tsc --noEmit` (app).

**Organization**: Tarefas agrupadas por user story. Sem novas dependências. Uma migração de banco (T002).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: US1 (cancelar), US2 (status visível), US3 (liberar horário), US4 (paciente cancela no app)

## Phase 1: Setup

Nenhuma tarefa: não há dependências novas nem estrutura nova a inicializar.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Status na entidade, migração e permissão, usados por todas as histórias

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase.

- [x] T001 Em `server/src/appointments/entities/appointment.entity.ts`, exportar `enum AppointmentStatus { SCHEDULED = 'scheduled', CANCELLED = 'cancelled' }` e adicionar a coluna `status` (`Appointment.status` e `AppointmentStatus` em [data-model.md](data-model.md); `type: 'enum'`, default `scheduled`, não nula), no mesmo padrão de `Role` em `server/src/auth/entities/user.entity.ts`
- [x] T002 Criar a migração `server/src/migration/1794900000000-AdicionaStatusAoAgendamento.ts` (escrita à mão, estilo das migrações vizinhas): `up` cria o tipo `appointment_status_enum` com `'scheduled'` e `'cancelled'` e adiciona `"appointment"."status"` como `NOT NULL DEFAULT 'scheduled'`; `down` remove a coluna e o tipo (research.md D1/D2) (depende de T001)
- [x] T003 [P] Em `server/src/appointments/appointments.policy.ts`, adicionar `cancel(user)` permitindo `Role.COORDINATOR`, `Role.LOBBY` e `Role.PATIENT`, e estender `server/src/appointments/appointments.policy.spec.ts` (permite os três; nega `PROFESSOR`, `TRAINEE` e usuário nulo) (research.md D4)

**Checkpoint**: modelo e permissão prontos.

---

## Phase 3: User Story 1 - Cancelar um agendamento (Priority: P1) 🎯 MVP

**Goal**: Um usuário autorizado cancela um agendamento e o status `cancelled` persiste.

**Independent Test**: Cenários 2 a 5 do [quickstart.md](quickstart.md).

- [x] T004 [US1] Em `server/src/appointments/appointments.service.ts`, implementar `cancel(user, id)` conforme research.md D5 e [contracts/cancel-appointment-api.md](contracts/cancel-appointment-api.md): carregar o agendamento com `patient` (404 "Agendamento não encontrado"); se `user.role` é `PATIENT` e `patient.id !== user.id` → `ForbiddenException`; 400 "O agendamento já está cancelado" se `Appointment.status` já for `cancelled`; 400 "Não é possível cancelar um agendamento já encerrado" se `endDate <= agora`; `UPDATE` condicional (`status = scheduled`) e, se nenhuma linha foi afetada, responder como "já cancelado"; devolver `{ id, status: 'cancelled' }` (depende de T001)
- [x] T005 [US1] Em `server/src/appointments/appointments.controller.ts`, adicionar `@Patch(':id/cancel')` com `@Can(AppointmentsPolicy, 'cancel')`, `ParseIntPipe` no `id`, `@CurrentUser()` e `@ApiOkResponse` (`{ id, status }`), declarado **antes** do `@Patch(':id')` genérico; sem alterar o stub `update` (depende de T003, T004)
- [x] T006 [US1] Estender `server/src/appointments/appointments.service.spec.ts` (cancel: sucesso; inexistente; já cancelado; encerrado; paciente dono ok; paciente de outro → Forbidden; corrida com `affected = 0` → "já cancelado") e `server/src/appointments/appointments.controller.spec.ts` (`PATCH /appointments/:id/cancel`: 200 para os papéis permitidos delegando a `cancel`; 403 para professor/trainee sem chamar o serviço; 401 sem usuário; 400 para id não numérico; não capturado por `PATCH :id`), seguindo o padrão dos testes existentes (depende de T004, T005)
- [x] T007 [P] [US1] Em `platform/src/features/appointments/services/appointments.service.ts`, trocar o corpo de `cancel(id)` para `PATCH /appointments/${id}/cancel` (sem corpo), devolvendo `{ id, status }`
- [x] T008 [US1] Em `platform/src/features/appointments/screens/AppointmentsPage.tsx`, ajustar `AppointmentDetail` e `cancelMutation`: o botão "Cancelar Agendamento" só aparece se `canEdit`, `status` ativo e `endDate` no futuro; ao clicar mostra confirmação inline ("Confirmar cancelamento" / "Voltar"); em erro exibe a mensagem retornada pela API (`error.response.data.message`) mantendo o status anterior; ao concluir, `invalidateQueries(['appointments'])` (FR-004, FR-005, FR-009, FR-013, FR-014; research.md D8) (depende de T007)

**Checkpoint**: US1 funcional de ponta a ponta no painel.

---

## Phase 4: User Story 2 - Status visível na agenda (Priority: P1)

**Goal**: O status aparece nas consultas e telas; cancelados continuam no histórico, identificados, e saem dos indicadores de próximos atendimentos.

**Independent Test**: Cenários 1, 6 e 7 do [quickstart.md](quickstart.md).

- [x] T009 [US2] Em `server/src/appointments/appointments.service.ts`, incluir `status: true` no `select` de `queryAppointments` (usado por `findAll` e `findAllUnlimited`) e acrescentar em `appointments.service.spec.ts` a verificação de que o `select` contém `status` (FR-008; research.md D7)
- [x] T010 [US2] Em `platform/src/features/appointments/screens/AppointmentsPage.tsx`, exibir o selo de status (Agendado/Cancelado, reaproveitando `STATUS_LABELS`/`STATUS_COLORS`) em cada item do histórico do paciente (`PatientProfile`) e garantir que o `AppointmentDetail` use `appointment.status` (padrão `scheduled`) (FR-009, FR-010) (depende de T008 por editar o mesmo arquivo)
- [x] T011 [P] [US2] Em `platform/src/features/dashboard/screens/DashboardPage.tsx`, excluir `status === 'cancelled'` do indicador de atendimentos de hoje, mantendo o filtro de "próximos" (FR-011, SC-007; research.md D10)

**Checkpoint**: US1 + US2 entregam o ciclo completo no painel.

---

## Phase 5: User Story 3 - Liberar o horário do profissional (Priority: P2)

**Goal**: Um agendamento cancelado não gera conflito de horário.

**Independent Test**: Cenário 8 do [quickstart.md](quickstart.md).

- [x] T012 [US3] Em `server/src/appointments/appointments.service.ts`, no `create`, adicionar `status: AppointmentStatus.SCHEDULED` ao `where` da busca de conflito do profissional (FR-012; research.md D6) (depende de T001)
- [x] T013 [US3] Estender `server/src/appointments/appointments.service.spec.ts`: a busca de conflito inclui `status: scheduled`; sem conflito ativo o `create` salva; com conflito ativo lança `BadRequestException` "O profissional já possui um agendamento nesse horário" (depende de T012)

**Checkpoint**: horário liberado após cancelar.

---

## Phase 6: User Story 4 - Paciente cancela pelo aplicativo (Priority: P2)

**Goal**: O app exibe o status e permite ao paciente cancelar o próprio agendamento ativo.

**Independent Test**: Cenários 9 a 11 do [quickstart.md](quickstart.md).

- [x] T014 [US4] Antes de editar o app, consultar a documentação versionada do Expo v57 (https://docs.expo.dev/versions/v57.0.0/) exigida por `app/AGENTS.md` e confirmar que apenas componentes do React Native e `@tanstack/react-query` já presentes serão usados (sem `Alert.alert`; research.md D9)
- [x] T015 [P] [US4] Em `app/src/features/appointments/services/appointment.type.ts`, adicionar `status` ao tipo `Appointment` (`'scheduled' | 'cancelled'`, [data-model.md](data-model.md)) e, em `app/src/features/appointments/services/appointment.service.ts`, o método `cancel(id)` que chama `PATCH /${id}/cancel` no `appointmentsClient` (depende de T014)
- [x] T016 [US4] Em `app/src/templates/get-recently-appointments.tsx`, exibir o selo "Agendado"/"Cancelado" em cada item; para itens ativos com `endDate` no futuro, mostrar o botão "Cancelar" com confirmação inline ("Confirmar cancelamento" / "Voltar", estado local, sem `Alert.alert`) e `useMutation` que chama `appointmentService.cancel` e invalida `["appointments"]`; em erro, mostrar mensagem clara mantendo o status anterior; sem botão em cancelados ou encerrados (FR-015, FR-016, SC-008) (depende de T015)

**Checkpoint**: paciente cancela pelo app.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T017 [P] Rodar `yarn test` em `server/`, `yarn build` em `platform/` e `npx tsc --noEmit` em `app/`; corrigir erros introduzidos por esta feature
- [x] T018 Confirmar ausência de regressão (FR-017): `GET /appointments` segue limitado a 5 itens, `GET /appointments/all` e o fluxo de criação do app (`appointments-create.tsx`) continuam funcionando, e o `PATCH /appointments/:id` genérico permanece inalterado
- [ ] T019 Executar os cenários de [quickstart.md](quickstart.md) com banco migrado (incluindo os papéis e o app móvel) e confirmar SC-001 a SC-008

---

## Dependencies & Execution Order

- Foundational (T001–T003) bloqueia as histórias. T002 depende de T001; T003 é independente.
- US1: T004 → T005 → T006; T007 → T008 (painel) em paralelo com o servidor após a Foundational.
- US2: T009 (servidor) e T011 (dashboard) independentes; T010 depende de T008 (mesmo arquivo).
- US3: T012 → T013; independente de US1/US2 depois de T001.
- US4: T014 → T015 → T016; depende do endpoint de T005 para validação ponta a ponta.
- Polish após as histórias desejadas.

## Parallel Examples

- Foundational: T001 ‖ T003 (T002 depois de T001).
- Após a Foundational: T004–T006 (servidor) ‖ T007 (platform service) ‖ T012 (conflito) ‖ T014 (docs do Expo).
- US2: T009 ‖ T011.

## Implementation Strategy

1. **MVP**: Foundational + US1 (cancelar no painel, com persistência e regras no servidor).
2. **Incremento 1**: US2 (status visível e indicadores corretos).
3. **Incremento 2**: US3 (horário liberado) e US4 (paciente cancela no app), independentes entre si.
4. Polish e validação pelo quickstart.

## Notes

- Total: 19 tarefas (Foundational 3, US1 5, US2 3, US3 2, US4 3, Polish 3).
- `appointments.service.ts`, `appointments.service.spec.ts` e `AppointmentsPage.tsx` são editados por várias tarefas: executar em ordem.
- A migração só roda ao subir a API; rodar `yarn migration:show` para conferir antes do quickstart.
- Fora de escopo: reativar agendamento, motivo/quem cancelou, notificações, outros status.
