# Implementation Plan: Cancelar Agendamento

**Branch**: `006-cancel-appointment` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-cancel-appointment/spec.md`

## Summary

Fazer o cancelamento funcionar de ponta a ponta. A entidade `Appointment` ganha a coluna `status`
(`scheduled` por padrão, `cancelled`), criada por migração com todos os registros existentes como
`scheduled`. O servidor ganha `PATCH /appointments/:id/cancel`, com as regras de negócio (papéis,
dono do agendamento, já cancelado, já encerrado, concorrência) e passa a ignorar agendamentos
cancelados na checagem de conflito de horário. O status é devolvido em todas as consultas. O painel
passa a exibir o status, confirmar e cancelar de verdade, e a desconsiderar cancelados nos indicadores
do painel inicial; o aplicativo móvel exibe o status e ganha a ação "Cancelar" para o paciente.

## Technical Context

**Language/Version**: TypeScript (strict). Server: NestJS + TypeORM + PostgreSQL. Platform: React 19, Vite 6. App: React Native 0.86 + Expo ~57 (Expo Router, NativeWind)

**Primary Dependencies**: existentes (`@tanstack/react-query` nos dois clientes, `class-validator`/Swagger no servidor). Nenhuma nova. Ver [research.md](research.md)

**Storage**: PostgreSQL; **uma migração** nova adicionando `appointment.status` (enum) com default `scheduled`

**Testing**: server: Vitest (service, controller, policy de agendamentos já têm spec; estender). platform e app: sem framework de testes; validação manual via [quickstart.md](quickstart.md), `yarn build` (platform) e checagem de tipos (app). Regras de negócio concentradas no servidor, onde há testes

**Target Platform**: API NestJS; painel web; app móvel (Expo, inclui web)

**Project Type**: web-app + mobile-app + API

**Performance Goals**: novo status visível na tela em até 2 s após cancelar (SC-003): invalidar e recarregar a lista

**Constraints**: textos em pt-BR; autorização no servidor (papéis + dono); migração versionada (sem `synchronize`); cancelamento definitivo; sem notificações, sem motivo, sem reativar; app deve consultar a documentação versionada do Expo antes de escrever código ([app/AGENTS.md](../../app/AGENTS.md))

**Scale/Scope**: 1 coluna, 1 migração, 1 endpoint, ajustes em 4 pontos do servidor, 3–4 arquivos no painel, 3 no app

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. API-Centric | Pass. Todas as regras (papel, dono, encerrado, já cancelado, concorrência) vivem no `AppointmentsService`; painel e app só chamam a API e exibem. |
| II. RBAC | Pass. `PATCH /appointments/:id/cancel` com `@Can(AppointmentsPolicy, 'cancel')`: coordenator, lobby e patient; professor e trainee recebem 403 no guard. O paciente só cancela o próprio agendamento (verificação de dono no serviço, 403 caso contrário). Telas: painel (coordenador/recepção, já é `canEdit`) e app (paciente). |
| III. Dados sensíveis | Pass. O endpoint devolve apenas `id` e `status`; mensagens de erro não vazam dados pessoais; a leitura continua com o `select` restrito. |
| IV. Contratos/Schema | Pass. Mudança de schema por **migração TypeORM escrita à mão** (sem `synchronize`); DTO/Swagger do endpoint e do campo `status`; cliente e servidor no mesmo conjunto de mudanças. Campo extra no payload é compatível com o app antigo. |
| V. Tipado, simples | Pass. TypeScript estrito; testes Vitest no servidor; estrutura das features respeitada (`platform/src/features/*`, `app/src/features/*`). Dois status apenas (YAGNI). Platform e app sem infra de testes: mesma exceção das features 003–005. |
| Stack / pt-BR | Pass. Migração com ENUM do PostgreSQL como `Role`; textos em pt-BR. |

Reavaliado após o design: sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/006-cancel-appointment/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cancel-appointment-api.md
└── tasks.md             # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
server/src/
├── migration/1794900000000-AdicionaStatusAoAgendamento.ts   # novo: enum + coluna status
├── appointments/
│   ├── entities/appointment.entity.ts        # + AppointmentStatus e coluna status
│   ├── appointments.policy.ts                # + cancel(user)
│   ├── appointments.controller.ts            # + PATCH :id/cancel
│   ├── appointments.service.ts               # + cancel(); status no select; conflito ignora cancelados
│   └── *.spec.ts                             # testes de service, controller e policy

platform/src/
├── features/appointments/
│   ├── services/appointments.service.ts      # cancel() -> PATCH /appointments/:id/cancel
│   ├── utils/patientAppointments.ts          # status helpers (rótulo, ativo/encerrado)
│   └── screens/AppointmentsPage.tsx          # selo de status, confirmação inline, erro, histórico
└── features/dashboard/screens/DashboardPage.tsx  # indicadores desconsideram cancelados

app/src/
├── features/appointments/services/
│   ├── appointment.type.ts                   # + status
│   └── appointment.service.ts                # + cancel(id)
└── templates/get-recently-appointments.tsx   # selo de status + ação Cancelar com confirmação
```

**Structure Decision**: monorepo com `server/`, `platform/` e `app/`. O servidor concentra as regras; os
clientes seguem o padrão existente de cada app.

## Complexity Tracking

Sem violações a justificar. Observações: o `PATCH /appointments/:id` genérico (stub) permanece como
está e deixa de ser usado pelo cancelamento; `GET /appointments/:id` continua sem `@Can` (preexistente,
fora do escopo).
