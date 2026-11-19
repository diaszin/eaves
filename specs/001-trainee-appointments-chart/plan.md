# Implementation Plan: Gráfico de Agendamentos do Estagiário

**Branch**: `001-trainee-appointments-chart` | **Date**: 2026-11-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-trainee-appointments-chart/spec.md`

## Summary

Ao selecionar um estagiário em `/trainees/:id` na plataforma backoffice, a tela de detalhes mostra um
gráfico de barras com a quantidade de agendamentos por mês (últimos 6 meses) em que o estagiário é o
`professional`. A contagem é feita no servidor por um novo endpoint agregado, restrito somente ao
coordenador, que retorna só contagens (sem dados de pacientes). O gráfico é desenhado com SVG/Tailwind
dentro do próprio código da plataforma, sem nova dependência.

## Technical Context

**Language/Version**: TypeScript (Node.js; NestJS 12 no servidor, React 19 + Vite 6 na plataforma)

**Primary Dependencies**: NestJS, TypeORM 1.x, `@nestjs/authorization` (`@Can`/`@Policy`), React Query 5, Tailwind 3, lucide-react. Nenhuma dependência nova.

**Storage**: PostgreSQL existente, tabela `Appointment`; sem mudança de schema (sem migration)

**Testing**: Vitest (`yarn test`) no servidor; a plataforma não tem runner de testes, então a verificação dela é `yarn build` + `yarn lint` + roteiro manual do quickstart

**Target Platform**: Navegador desktop (plataforma backoffice) servida por Docker Compose

**Project Type**: web-service (API) + web application (plataforma)

**Performance Goals**: gráfico visível em até 2 s (SC-001); consulta agregada por um único `GROUP BY` mensal

**Constraints**: fuso `America/Bahia` (já configurado na conexão); textos em pt-BR; apenas contagens agregadas

**Scale/Scope**: 1 endpoint, 1 componente de gráfico, 1 método de serviço no cliente; dezenas de estagiários e centenas de agendamentos por estagiário

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|-----------|-----------|
| I. API-Centric | PASS: a agregação fica na API; a plataforma só exibe |
| II. RBAC (NON-NEGOTIABLE) | PASS: policy própria no servidor permite só `coordinator`; o endpoint nega os demais e a tela oculta o gráfico para eles |
| III. Sensitive Data | PASS: resposta traz apenas `{month, count}`, sem pacientes nem notas |
| IV. Validated Contracts & Schema | PASS: `id` validado por pipe, resposta documentada no Swagger; nenhuma mudança de schema |
| V. Tested, Typed, Simple | PASS: testes Vitest da policy e do serviço; gráfico em SVG sem biblioteca nova (YAGNI) |
| Stack (pt-BR, Docker) | PASS |

Resultado: sem violações; a seção Complexity Tracking não se aplica. Reavaliado após o Phase 1: continua PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-trainee-appointments-chart/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── trainee-appointments-monthly.md
└── tasks.md             # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
server/src/appointments/
├── appointments.controller.ts      # novo GET professionals/:professionalId/monthly-count
├── appointments.service.ts         # novo countByMonthForProfessional()
├── appointments.policy.ts          # nova regra viewProfessionalStats (somente coordinator)
├── dto/monthly-count.dto.ts        # resposta documentada (Swagger)
├── appointments.service.spec.ts    # novo
└── appointments.policy.spec.ts     # novo

platform/src/features/
├── appointments/services/appointments.service.ts   # novo monthlyByProfessional()
└── users/
    ├── components/TraineeAppointmentsChart.tsx      # novo gráfico de barras
    └── screens/UsersPage.tsx                        # renderiza o gráfico em UserDetail (role trainee)
```

**Structure Decision**: aplicação web com API separada, como o repositório já está organizado. A lógica
de contagem entra no módulo `appointments` (dono da entidade) e o gráfico entra na feature `users` da
plataforma, onde o detalhe do estagiário já é renderizado. O app móvel não é alterado.

## Complexity Tracking

Sem violações a justificar.
