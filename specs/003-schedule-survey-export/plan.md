# Implementation Plan: Exportação de Escalas e Pesquisas (Excel e PDF)

**Branch**: `003-schedule-survey-export` | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-schedule-survey-export/spec.md`

## Summary

Adicionar, no painel `platform/`, botões "Exportar Excel" e "Exportar PDF" no detalhe da escala
(`SchedulesPage`) e no detalhe da pesquisa (`SurveysPage`). Os arquivos são gerados no navegador a
partir dos dados que as telas já carregam (a escala pode ainda buscar as demais escalas ativas do
estagiário via endpoint existente). As bibliotecas de geração são carregadas sob demanda (import
dinâmico) para não pesar o bundle inicial. Nenhuma alteração na API.

## Technical Context

**Language/Version**: TypeScript ~5.6 (strict), React 19, Vite 6

**Primary Dependencies**: existentes: `@tanstack/react-query`, `lucide-react`, Tailwind. Novas: `exceljs` (.xlsx), `jspdf` + `jspdf-autotable` (PDF), todas via `import()` dinâmico. Ver [research.md](research.md)

**Storage**: N/A (sem persistência; arquivo baixado pelo navegador)

**Testing**: o `platform/` não tem framework de testes; validação manual via [quickstart.md](quickstart.md) + `yarn build` (tsc) e `yarn lint`. A montagem das linhas fica em funções puras para facilitar testes futuros

**Target Platform**: navegadores modernos (painel web)

**Project Type**: web-app (cliente fino do backoffice)

**Performance Goals**: arquivo individual pronto em até 5 s (SC-004)

**Constraints**: textos em pt-BR, acentos preservados; sem novos endpoints; sem restrição extra de papel (clarificação 1)

**Scale/Scope**: 2 telas alteradas, 1 módulo compartilhado de exportação, 9 perguntas por pesquisa, dezenas de turnos por escala

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. API-Centric | Pass. O cliente continua fino: só formata dados que a API já entrega; nenhuma regra de negócio nova nem acesso ao banco. |
| II. RBAC | Pass. Sem endpoint novo; a exportação usa as mesmas chamadas já autorizadas no servidor. Papéis que podem exportar = papéis que já veem a tela (clarificação 1). |
| III. Dados sensíveis | Pass com atenção. O PHQ-9 sai do sistema por ação explícita de usuário autorizado; geração 100% local, nada enviado a terceiros, sem log de conteúdo. |
| IV. Contratos/Schema | Pass. Sem API nem migração. |
| V. Tipado, simples | Pass. TypeScript, estrutura `platform/src/features/*` + `shared`. Sem testes automatizados no platform (sem infraestrutura); ver Complexity Tracking. |
| Stack / pt-BR | Pass. |

Reavaliado após o design: sem mudanças.

## Project Structure

### Documentation (this feature)

```text
specs/003-schedule-survey-export/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── export-ui.md
└── tasks.md             # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
platform/
├── package.json                                  # + exceljs, jspdf, jspdf-autotable
└── src/
    ├── shared/
    │   ├── components/ui/ExportMenu.tsx          # botões Excel/PDF com estado de carregamento/erro
    │   └── utils/export/
    │       ├── types.ts                          # ExportDocument (título, metadados, tabelas)
    │       ├── toXlsx.ts                         # ExportDocument -> Blob .xlsx
    │       ├── toPdf.ts                          # ExportDocument -> Blob PDF (A4)
    │       └── download.ts                       # baixa Blob, monta nome de arquivo
    └── features/
        ├── schedules/
        │   ├── utils/scheduleExport.ts           # Schedule[] -> ExportDocument
        │   └── screens/SchedulesPage.tsx         # botão no ScheduleDetailView
        └── surveys/
            ├── utils/surveyExport.ts             # Survey -> ExportDocument
            └── screens/SurveysPage.tsx           # botão no SurveyDetail
```

**Structure Decision**: modelo intermediário `ExportDocument`, neutro quanto ao formato. Cada
feature só converte seus dados nele, e os conversores compartilhados geram .xlsx e PDF. Isso evita
duplicar a lógica de formatação entre escala e pesquisa.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Sem testes automatizados no platform | Não há framework de testes no projeto | Adicionar Vitest só para esta feature excede o escopo (YAGNI); as funções puras permitem adicionar depois |
