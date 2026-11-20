# Implementation Plan: Agendamentos Agrupados por Paciente

**Branch**: `005-appointments-by-patient` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-appointments-by-patient/spec.md`

## Summary

Replicar para Agendamentos o modelo da feature [004](../004-surveys-by-patient/plan.md): a lista do painel
passa a mostrar uma linha por paciente; o painel direito mostra o perfil com histórico e filtros de
período e profissional; abrir um agendamento mostra o detalhe existente no mesmo painel. O agrupamento
e os filtros são feitos no cliente. Como a listagem atual `GET /appointments` está limitada a 5 itens e
é usada pelo app móvel e pelo painel inicial, ela permanece intacta; o servidor ganha uma consulta
separada `GET /appointments/all` (mesmas regras de acesso e mesmo formato), usada só pelo painel de
Agendamentos. O tipo do painel passa a ler o campo `professional` que a API realmente devolve. Sem
migração.

## Technical Context

**Language/Version**: TypeScript (strict), React 19, Vite 6 (platform); NestJS + TypeORM (server)

**Primary Dependencies**: existentes: `@tanstack/react-query`, `react-router-dom`, `lucide-react`, Tailwind, `clsx`. Nenhuma nova. Ver [research.md](research.md)

**Storage**: PostgreSQL existente (entidade `Appointment`); sem alteração de schema

**Testing**: server: Vitest (`appointments.service.spec.ts` e `appointments.controller.spec.ts` já existem; estender); platform: sem framework de testes, validação manual via [quickstart.md](quickstart.md) + `yarn build`. Agrupamento e filtros em funções puras (`patientAppointments.ts`)

**Target Platform**: navegadores modernos (painel web); API NestJS

**Project Type**: web-app (cliente fino + API)

**Performance Goals**: filtro atualiza o histórico em < 1 s para até 500 agendamentos por paciente (SC-004), filtragem em memória

**Constraints**: textos em pt-BR; mesmos papéis de hoje (`AppointmentsPolicy.view`); `GET /appointments` inalterada (FR-016); rotas `/appointments/:id` continuam válidas (FR-015)

**Scale/Scope**: 1 endpoint novo (reuso da mesma consulta), 3–4 arquivos de UI na feature `appointments`, 1 rota nova, 1 util compartilhado de datas

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. API-Centric | Pass. Dados e autorização na API; o cliente apenas agrupa e filtra para exibição. Consulta nova no módulo `appointments` (controller/service). |
| II. RBAC | Pass. `GET /appointments/all` usa `@Can(AppointmentsPolicy, 'view')`, os mesmos papéis de `GET /appointments` (patient, professor, coordinator, lobby, trainee) e, como hoje, o paciente só vê os próprios agendamentos (filtro por `patient.id`). A tela é a página de Agendamentos existente, sem papel novo; `patient` segue sem acesso ao backoffice. |
| III. Dados sensíveis | Pass. A resposta usa o mesmo `select` restrito de colunas de usuário que a listagem atual (sem hash de senha, sem campos extras); sem logs de conteúdo. |
| IV. Contratos/Schema | Pass. Endpoint novo documentado no Swagger e em [contracts/](contracts/appointments-ui-api.md); sem alteração de schema, sem migração; cliente e servidor no mesmo conjunto de mudanças. A rota é declarada antes de `:id` para não colidir. |
| V. Tipado, simples | Pass. TypeScript estrito, estrutura `platform/src/features/*`; testes Vitest no servidor para o endpoint novo; platform sem infra de testes (mesma exceção das features 003/004). Escolha mais simples: reaproveitar a consulta existente parametrizando o limite, sem DTOs novos. |
| Stack / pt-BR | Pass. |

Reavaliado após o design: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/005-appointments-by-patient/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── appointments-ui-api.md
└── tasks.md             # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
server/src/appointments/
├── appointments.service.ts          # findAll(user) mantém take:5; novo findAllUnlimited(user) reaproveitando a mesma consulta
├── appointments.controller.ts       # + GET all (antes de :id)
├── appointments.service.spec.ts     # + testes: sem limite; paciente só vê os próprios
└── appointments.controller.spec.ts  # + teste do novo endpoint

platform/src/
├── router.tsx                                   # + appointments/patient/:patientId (mantém appointments/:id)
├── shared/
│   ├── utils/dateRange.ts                       # novo: toLocalDateKey, isDateRangeValid (extraídos de surveys)
│   └── components/layout/SectionPanel.tsx       # navegação da lista por paciente
└── features/
    ├── surveys/utils/patientSurveys.ts          # passa a importar de shared/utils/dateRange
    └── appointments/
        ├── services/appointments.service.ts     # + listAll(), campo professional
        ├── utils/patientAppointments.ts         # novo: agrupar por paciente, filtrar por data/profissional
        ├── components/
        │   ├── AppointmentsList.tsx             # passa a listar pacientes
        │   └── PatientAppointmentFilters.tsx    # novo: De/Até, profissional, limpar
        └── screens/AppointmentsPage.tsx         # perfil + histórico + detalhe; resolve rota legada
```

**Structure Decision**: aplicação web existente (Three-Pane Layout). Mantém `platform/src/features/*`;
lista no `SectionPanel`, perfil no painel direito, sem página separada (clarificação da 004 reaplicada).

## Complexity Tracking

Sem violações a justificar. Observações que condicionam o escopo (não corrigidas aqui):
`AppointmentsService.update` é um stub no servidor e a entidade não tem status, então o botão
"Cancelar" do detalhe não persiste nada hoje; o comportamento é preservado como está (ver research.md D6).
