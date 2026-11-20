# Implementation Plan: Pesquisas Agrupadas por Paciente

**Branch**: `004-surveys-by-patient` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-surveys-by-patient/spec.md`

## Summary

Na página de Pesquisas do `platform/`, trocar a lista de respostas (uma por data) por uma lista de
pacientes (uma linha por pessoa). Ao selecionar um paciente, o painel direito mostra o perfil com
o histórico de respostas e filtros de intervalo de datas e categoria. Abrir uma resposta mostra o
detalhe atual (com exportação) no mesmo painel. O agrupamento por paciente e a filtragem são feitos
no cliente sobre a lista que a API já entrega; a única mudança na API é aditiva: incluir o campo
`category` em cada resposta (hoje sempre `PHQ`), base para o filtro de categoria. Sem migração.

## Technical Context

**Language/Version**: TypeScript (strict), React 19, Vite 6 (platform); NestJS + TypeORM (server)

**Primary Dependencies**: existentes: `@tanstack/react-query`, `react-router-dom`, `lucide-react`, Tailwind, `clsx`. Nenhuma nova. Ver [research.md](research.md)

**Storage**: PostgreSQL existente (tabela `survey` já possui coluna `type`); sem alteração de schema

**Testing**: server: Vitest (spec do `SurveyService` para o campo `category`); platform: sem framework de testes, então validação manual via [quickstart.md](quickstart.md) + `yarn build` e `yarn lint`. Agrupamento e filtros ficam em funções puras (`patientSurveys.ts`) para facilitar testes futuros

**Target Platform**: navegadores modernos (painel web)

**Project Type**: web-app (cliente fino do backoffice + API)

**Performance Goals**: filtro atualiza o histórico em < 1 s para até 500 respostas por paciente (SC-003); filtragem em memória

**Constraints**: textos em pt-BR; mesmos papéis de hoje (`SurveyPolicy.viewResponses`); rota antiga `/surveys/:id` deve continuar válida (FR-014)

**Scale/Scope**: 3 arquivos de UI alterados/criados na feature `surveys`, 1 rota nova, 1 campo aditivo na API

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. API-Centric | Pass. Autorização e dados continuam na API; o cliente só agrupa e filtra para exibição, sem regra de negócio nova. A classificação de gravidade segue calculada no servidor. |
| II. RBAC | Pass. Nenhum endpoint novo; ambos os endpoints usados mantêm `@Can(SurveyPolicy, 'viewResponses')` (coordinator, professor, lobby, trainee). `patient` segue sem acesso. Telas: apenas a página de Pesquisas existente, mesmos papéis. |
| III. Dados sensíveis | Pass. Nenhum dado novo exposto; o campo `category` não é sensível. Sem logs de conteúdo clínico. |
| IV. Contratos/Schema | Pass. Mudança aditiva e compatível no payload (campo extra) documentada em [contracts/](contracts/); sem alteração de schema, logo sem migração. Cliente e servidor no mesmo conjunto de mudanças. |
| V. Tipado, simples | Pass. TypeScript estrito, estrutura `platform/src/features/surveys`. Teste Vitest no servidor; platform sem infra de testes (mesma exceção da feature 003). Solução mais simples (agrupamento no cliente) escolhida em vez de novos endpoints. |
| Stack / pt-BR | Pass. |

Reavaliado após o design: sem mudanças e sem violações.

## Project Structure

### Documentation (this feature)

```text
specs/004-surveys-by-patient/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── surveys-ui-api.md
└── tasks.md             # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
server/src/survey/
├── survey.service.ts              # toPHQ9Responses: + category: 'PHQ'
└── survey.service.spec.ts         # novo: valida category e agrupamento por dia

platform/src/
├── router.tsx                     # + rota surveys/patient/:patientId (mantém surveys/:id)
├── shared/components/layout/
│   └── SectionPanel.tsx           # navegação da lista por paciente
└── features/surveys/
    ├── services/surveys.service.ts        # + category em Survey; rótulos de categoria
    ├── utils/patientSurveys.ts            # novo: agrupar por paciente, filtrar por data/categoria
    ├── components/
    │   ├── SurveysList.tsx                # passa a listar pacientes
    │   └── PatientSurveyFilters.tsx       # novo: data inicial/final, categoria, limpar
    └── screens/SurveysPage.tsx            # perfil do paciente + histórico + detalhe
```

**Structure Decision**: aplicação web existente (Three-Pane Layout: lista no `SectionPanel`,
conteúdo na página). Mantém-se o padrão `platform/src/features/*`; o painel esquerdo lista pacientes
e o direito mostra o perfil, sem criar página separada (clarificação 1).

## Complexity Tracking

Sem violações a justificar. Observação: o platform não possui framework de testes (mesma situação da
feature 003); a verificação é manual + `build`/`lint`.
