---

description: "Task list for Pesquisas Agrupadas por Paciente"
---

# Tasks: Pesquisas Agrupadas por Paciente

**Input**: Design documents from `/specs/004-surveys-by-patient/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/surveys-ui-api.md, quickstart.md

**Tests**: A spec não pede TDD. Inclui-se apenas o spec Vitest do servidor exigido pela constituição para a mudança de comportamento da API (T002). O `platform/` não tem framework de testes; validação por [quickstart.md](quickstart.md), `yarn build` e `yarn lint`.

**Organization**: Tarefas agrupadas por user story. Sem novas dependências e sem migração.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: US1 (lista por paciente), US2 (perfil/histórico), US3 (filtros)

## Phase 1: Setup

Nenhuma tarefa: não há dependências novas nem estrutura nova a inicializar.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contrato de dados e lógica pura de agrupamento/filtro usados pelas três histórias

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase.

- [x] T001 [P] Em `server/src/survey/survey.service.ts`, incluir `category: firstAnswer.type` no objeto retornado por `toPHQ9Responses` (campo aditivo `Survey.category` em [data-model.md](data-model.md); contrato em [contracts/surveys-ui-api.md](contracts/surveys-ui-api.md)); sem mudança de schema nem migração
- [x] T002 Criar `server/src/survey/survey.service.spec.ts` (Vitest, seguindo o padrão de `server/src/appointments/appointments.service.spec.ts`) cobrindo: resposta contém `category: 'PHQ'`; registros do mesmo paciente no mesmo dia viram uma única resposta com `totalScore` somado (depende de T001)
- [x] T003 [P] Em `platform/src/features/surveys/services/surveys.service.ts`, adicionar `category: string` à interface `Survey` (`Survey.category`, conforme [data-model.md](data-model.md)) e exportar `SURVEY_CATEGORY_LABELS` (`PHQ` → `PHQ-9`) mais `getCategoryLabel(category)` que devolve o próprio valor quando desconhecido (seção Categorias de [data-model.md](data-model.md))
- [x] T004 [P] Criar `platform/src/features/surveys/utils/patientSurveys.ts` com funções puras tipadas: `groupByPatient(surveys)` → `PatientSurveySummary[]` (`PatientSurveySummary.patientId`, `.displayName`, `.email`, `.responseCount`, `.lastResponseAt`, `.surveys`; ordenado por `lastResponseAt` decrescente e `surveys` por `createdAt` decrescente); `searchPatients(summaries, query)` (nome ou e-mail, sem diferenciar maiúsculas); `getAvailableCategories(surveys)`; `isDateRangeValid(from, to)`; `filterSurveys(surveys, filters)` aplicando `PatientSurveyFilters.from`, `.to` (inclusivos, data local `YYYY-MM-DD` de `Survey.createdAt`) e `.category` (`''` = todas), com E lógico e ignorando o intervalo quando inválido (regras em [data-model.md](data-model.md))

**Checkpoint**: contrato e utilitários prontos.

---

## Phase 3: User Story 1 - Lista de pacientes (Priority: P1) 🎯 MVP

**Goal**: A página de Pesquisas lista pacientes (uma linha por pessoa) em vez de respostas por data.

**Independent Test**: Cenário 1 do [quickstart.md](quickstart.md): cada paciente aparece uma única vez com "N respostas" e data da última, ordenados pela mais recente; busca funciona; vazio mostra mensagem.

- [x] T005 [US1] Reescrever `platform/src/features/surveys/components/SurveysList.tsx` para listar `PatientSurveySummary` usando `groupByPatient`/`searchPatients` de T004: nome (ou e-mail), "N respostas", data da última via `formatDate` de `platform/src/shared/utils/formatDate.ts`; item ativo quando a rota é do paciente; estados de carregamento, erro e vazio ("Nenhuma pesquisa encontrada"); a prop `onSelect` passa a receber o `patientId`
- [x] T006 [P] [US1] Em `platform/src/router.tsx`, adicionar a rota `surveys/patient/:patientId` apontando para `SurveysPage`, mantendo `surveys` e `surveys/:id` (FR-014)
- [x] T007 [US1] Em `platform/src/shared/components/layout/SectionPanel.tsx`, trocar `onSelect` da seção `surveys` para `navigate(`/surveys/patient/${patientId}`)` (depende de T005)
- [x] T008 [US1] Em `platform/src/features/surveys/screens/SurveysPage.tsx`, atualizar o estado sem seleção para "Selecione um paciente" / "Escolha um paciente na lista à esquerda para ver suas pesquisas."

**Checkpoint**: US1 funcional e demonstrável (a seleção ainda não abre o perfil completo).

---

## Phase 4: User Story 2 - Perfil e histórico do paciente (Priority: P1)

**Goal**: Ao selecionar um paciente, o painel direito mostra identificação e histórico de respostas; abrir uma resposta mostra o detalhe atual com exportação.

**Independent Test**: Cenários 2 e 7 do [quickstart.md](quickstart.md).

- [x] T009 [US2] Em `platform/src/features/surveys/screens/SurveysPage.tsx`, criar o componente `PatientProfile` (para a rota `surveys/patient/:patientId`): cabeçalho com `Avatar`, nome/e-mail e total de respostas; lista do histórico (mais recente primeiro) com data, pontuação `N/27` e selo de gravidade reaproveitando `SEVERITY_STYLES` e `PHQ9_SEVERITY_LABELS`; selecionar um item define `?response=<id>` e exibe o `SurveyDetail` existente (com `ExportMenu`) abaixo/ao lado; sem `response`, abre a resposta mais recente por padrão; paciente com uma única resposta funciona (FR-005, FR-006)
- [x] T010 [US2] Em `platform/src/features/surveys/screens/SurveysPage.tsx`, tratar a rota legada `surveys/:id` (FR-014): obter a lista (`useQuery` com a mesma chave `['surveys']`), localizar a resposta `id`, e redirecionar (`replace`) para `/surveys/patient/<patientId>?response=<id>`; id inexistente mostra "Questionário não encontrado" (depende de T009)
- [x] T011 [US2] Em `platform/src/features/surveys/screens/SurveysPage.tsx`, garantir estados de carregamento, erro ("Erro ao carregar pesquisas.") e paciente inexistente ("Paciente não encontrado") no perfil (FR-012)

**Checkpoint**: US1 + US2 entregam a visão por pessoa completa.

---

## Phase 5: User Story 3 - Filtros de data e categoria (Priority: P2)

**Goal**: No perfil, filtrar o histórico por intervalo de datas e categoria.

**Independent Test**: Cenários 3 a 6 do [quickstart.md](quickstart.md).

- [x] T012 [P] [US3] Criar `platform/src/features/surveys/components/PatientSurveyFilters.tsx`: campos "De" e "Até" (`Input` de `platform/src/shared/components/ui/Input.tsx`, `type="date"`; `PatientSurveyFilters.from`, `.to`), seletor "Categoria" com "Todas" + categorias recebidas por prop rotuladas por `getCategoryLabel` (`PatientSurveyFilters.category`), botão "Limpar filtros" e aviso "A data inicial não pode ser posterior à final." quando `isDateRangeValid` for falso (FR-007, FR-008, FR-010, FR-011)
- [x] T013 [US3] Integrar em `PatientProfile` (`platform/src/features/surveys/screens/SurveysPage.tsx`): estado dos filtros local ao perfil, reiniciado por `key={patientId}`; categorias via `getAvailableCategories`; histórico passa a usar `filterSurveys` (E lógico, atualização imediata) (FR-009, cenário 6) (depende de T009, T012)
- [x] T014 [US3] Em `PatientProfile`, quando `filterSurveys` retornar vazio com filtros ativos, mostrar "Nenhuma pesquisa encontrada para os filtros selecionados" com ação "Limpar filtros"; se a resposta aberta sair do conjunto filtrado, abrir a primeira do resultado ou ocultar o detalhe (depende de T013)

**Checkpoint**: todas as histórias funcionais.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T015 [P] Rodar `yarn lint` e `yarn test` em `server/`, e `yarn build` e `yarn lint` em `platform/`; corrigir erros (build e testes OK; `yarn lint` do platform falha por `eslint` não instalado e o do server por erro preexistente em `auth.service.ts:270`, ambos fora do escopo)
- [ ] T016 Executar os cenários de [quickstart.md](quickstart.md) (incluindo papéis: `patient` sem acesso, demais papéis como antes) e confirmar que detalhe e exportação não regrediram (SC-005)
- [x] T017 [P] Atualizar o título da seção em `platform/src/shared/components/layout/SectionPanel.tsx` (`SECTION_TITLES.surveys`) somente se o texto "Questionários PHQ-9" ficar inadequado para a lista por paciente (ex.: "Pesquisas")

---

## Dependencies & Execution Order

- Foundational (T001–T004) → bloqueia todas as histórias. T002 depende de T001; T003 e T004 independentes entre si.
- US1 (T005–T008) → MVP. T007 depende de T005; T006 e T008 independentes.
- US2 (T009–T011) depende de US1 (rota e navegação) e de T003/T004.
- US3 (T012–T014) depende de US2 (perfil existente); T012 pode ser feito em paralelo com US1/US2.
- Polish após as histórias desejadas.

## Parallel Examples

- Foundational: T001 ‖ T003 ‖ T004 (depois T002).
- US1: T006 ‖ T008 enquanto T005 é feito.
- US3: T012 em paralelo com T009–T011.

## Implementation Strategy

1. **MVP**: Foundational + US1 (lista por paciente) já altera o eixo de organização pedido.
2. **Incremento 1**: US2 completa o perfil e o histórico (valor principal de análise por pessoa).
3. **Incremento 2**: US3 adiciona os filtros.
4. Polish e validação pelo quickstart.

## Notes

- Total: 17 tarefas (Foundational 4, US1 4, US2 3, US3 3, Polish 3).
- Arquivos compartilhados (`SurveysPage.tsx`) são editados por várias tarefas: executar em ordem.

---

## Phase 7: Convergence

- [x] T018 Adicionar ação "Tentar novamente" (`refetch` do `useQuery` de `['surveys']`) nos estados de erro de `platform/src/features/surveys/components/SurveysList.tsx` e `platform/src/features/surveys/screens/SurveysPage.tsx` per spec Edge Cases "Falha ao carregar" / FR-012 (partial)
