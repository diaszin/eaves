---

description: "Task list for Exportação de Escalas e Pesquisas (Excel e PDF)"
---

# Tasks: Exportação de Escalas e Pesquisas (Excel e PDF)

**Input**: Design documents from `/specs/003-schedule-survey-export/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/export-ui.md, quickstart.md

**Tests**: Não solicitados na spec e o `platform/` não tem framework de testes (ver Complexity Tracking no plan.md). Validação por [quickstart.md](quickstart.md), `yarn build` e `yarn lint`.

**Organization**: Tarefas agrupadas por user story. Todo o código fica em `platform/` (nenhuma mudança no `server/`).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência)
- **[Story]**: US1 (escala), US2 (pesquisa)

## Phase 1: Setup

**Purpose**: Dependências de geração de arquivos

- [x] T001 Adicionar `exceljs`, `jspdf` e `jspdf-autotable` como dependências em `platform/package.json` e atualizar `platform/yarn.lock` (rodar `yarn add` em `platform/`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Módulo compartilhado de exportação usado pelas duas histórias

**⚠️ CRITICAL**: Nenhuma user story começa antes desta fase.

- [x] T002 [P] Criar os tipos `ExportDocument` e `ExportTable` em `platform/src/shared/utils/export/types.ts`, conforme [data-model.md](data-model.md) (`ExportDocument.title`, `.fileBaseName`, `.meta`, `.tables`, `.summary`, `.generatedAt`; `ExportTable.name`, `.columns`, `.rows`)
- [x] T003 [P] Criar `platform/src/shared/utils/export/download.ts` com `downloadBlob(blob, filename)` e `buildFileName(prefix, personName, ext)` (data AAAA-MM-DD, acentos removidos e espaços trocados por hífen; ver research.md R7)
- [x] T004 Criar `platform/src/shared/utils/export/toXlsx.ts`: `toXlsxBlob(doc: ExportDocument)` usando `import('exceljs')` dinâmico; uma aba por `ExportTable`, bloco de metadados no topo, cabeçalho em negrito, larguras de coluna ajustadas, `summary` ao final (depende de T002)
- [x] T005 Criar `platform/src/shared/utils/export/toPdf.ts`: `toPdfBlob(doc: ExportDocument)` usando `import('jspdf')` e `import('jspdf-autotable')` dinâmicos; A4, título, metadados, tabelas paginadas, `summary` e `generatedAt` no rodapé; acentos pt-BR preservados (depende de T002)
- [x] T006 [P] Criar `platform/src/shared/components/ui/ExportMenu.tsx` conforme [contracts/export-ui.md](contracts/export-ui.md): botões "Exportar Excel" e "Exportar PDF" reutilizando `Button` de `platform/src/shared/components/ui/Button.tsx`, ícones `lucide-react`, estado de carregamento por formato e mensagem de erro "Não foi possível gerar o arquivo. Tente novamente." (FR-008)

**Checkpoint**: Módulo de exportação pronto; histórias podem começar.

---

## Phase 3: User Story 1 - Exportar a escala de um estagiário (Priority: P1) 🎯 MVP

**Goal**: Exportar em Excel/PDF os dias e horários de um estagiário, para a escala aberta ou todas as ativas dele.

**Independent Test**: Abrir uma escala com turnos, exportar Excel e PDF nos dois escopos e conferir estagiário, período, status e todos os turnos ordenados (quickstart, seção Escala).

### Implementation for User Story 1

- [x] T007 [P] [US1] Criar `platform/src/features/schedules/utils/scheduleExport.ts` com `buildScheduleExport(schedules: Schedule[], scope: 'single' | 'all'): ExportDocument`: `meta` com Estagiário (`user.profile.fullname` ou `user.email`), Período (`startDate` a `endDate`, ou "sem data de término") e Status (Ativa/Inativa); colunas Dia, Início, Término, Local, Observações, mais Escala quando `scope` for `all` (FR-002, FR-002a); ordenação domingo→sábado, depois `customDate` crescente, desempate por `startTime` (FR-003); datas `dd/mm/aaaa` (FR-010). Reutilizar os nomes dos dias de `DAYS_OF_WEEK` (extrair para `platform/src/features/schedules/utils/days.ts` ou exportar de onde já existe, sem duplicar)
- [x] T008 [US1] Adicionar a ação de exportar ao `ScheduleDetailView` em `platform/src/features/schedules/screens/SchedulesPage.tsx`: `ExportMenu` no cabeçalho do detalhe, visível para todos os papéis (fora do bloco `canManage`); seletor de escopo "Esta escala" / "Todas as escalas ativas do estagiário" (para "todas", chamar `schedulesService.list({ userId: schedule.user.id, isActive: true })`); se não houver turnos no escopo, mostrar "Não há horários para exportar." e não gerar arquivo (FR-007); gerar com `toXlsxBlob`/`toPdfBlob` e baixar com `downloadBlob` usando o nome `escala-<estagiário>-<data>` (FR-009) (depende de T003–T007)

**Checkpoint**: US1 funcional e testável sozinha.

---

## Phase 4: User Story 2 - Exportar a pesquisa (PHQ-9) de um paciente (Priority: P1)

**Goal**: Exportar em Excel/PDF as pontuações, as perguntas e o total de uma resposta de paciente.

**Independent Test**: Abrir uma resposta, exportar Excel e PDF e conferir 9 perguntas, pontuações, rótulos, total e gravidade iguais aos da tela (quickstart, seção Pesquisa).

### Implementation for User Story 2

- [x] T009 [P] [US2] Mover `SCORE_LABELS` de `platform/src/features/surveys/screens/SurveysPage.tsx` para `platform/src/features/surveys/services/surveys.service.ts` (exportado) e ajustar o import na página (research.md R6)
- [x] T010 [US2] Criar `platform/src/features/surveys/utils/surveyExport.ts` com `buildSurveyExport(survey: Survey): ExportDocument`: `meta` com Paciente (`patient.profile.fullname` ou `patient.email`) e Data da resposta (`createdAt`, pt-BR); tabela Nº, Pergunta, Pontuação, Resposta, uma linha por item de `PHQ9_QUESTIONS` usando `answers[questionIndex].score` e `SCORE_LABELS`, ou "Sem resposta" quando ausente; `summary` com Total (`totalScore` de 27) e Gravidade (`PHQ9_SEVERITY_LABELS[severity]`), sem recalcular (FR-005, FR-006) (depende de T009)
- [x] T011 [US2] Adicionar a ação de exportar ao `SurveyDetail` em `platform/src/features/surveys/screens/SurveysPage.tsx`: `ExportMenu` no cabeçalho do detalhe, visível a quem vê a tela (FR-011); gerar com `toXlsxBlob`/`toPdfBlob` e baixar com nome `pesquisa-phq9-<paciente>-<data>` (FR-009) (depende de T003–T006, T010)

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T012 [P] Rodar `yarn build` e `yarn lint` em `platform/` e corrigir erros de tipo ou lint
- [ ] T013 Executar o roteiro completo de [quickstart.md](quickstart.md) (escala nos dois escopos, escala sem turnos, pesquisa com e sem pergunta sem resposta, papéis de menor acesso) e conferir acentos, ordenação e valores iguais aos da tela (FR-006, SC-003, SC-005)
- [x] T014 [P] Conferir que o bundle inicial não inclui `exceljs`/`jspdf` (apenas chunks carregados sob demanda) na saída de `yarn build`

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002–T006)** → **US1 (T007–T008)** e **US2 (T009–T011)** → **Polish (T012–T014)**.
- US1 e US2 são independentes entre si e podem ser feitas em paralelo após a Fase 2.
- Dentro da Fase 2: T002, T003 e T006 em paralelo; T004 e T005 dependem de T002.

### Parallel Example

```text
Após T001: T002, T003 e T006 juntos; depois T004 e T005 juntos.
Após a Fase 2: T007 e T009 juntos; depois T008 (US1) e T010→T011 (US2) em paralelo.
```

## Implementation Strategy

- **MVP**: Fases 1–3 (escala em Excel e PDF). Entrega valor sozinha.
- **Incremental**: adicionar US2 (pesquisa) em seguida; ambas são P1 e compartilham o módulo da Fase 2.
- Fechar com a Fase 5 antes de abrir o PR.

## Phase 6: Convergence

- [x] T015 Incluir período de vigência e status (Ativa/Inativa) de cada escala no arquivo exportado no modo "todas as escalas ativas", por exemplo colunas adicionais em `platform/src/features/schedules/utils/scheduleExport.ts`, per FR-002 (partial)
- [x] T016 Alinhar a tela de detalhe da pesquisa ao arquivo exportado: exibir "Sem resposta" (em vez de pontuação 0 / "Nunca") para pergunta sem registro em `platform/src/features/surveys/screens/SurveysPage.tsx`, per FR-006 (partial)
