# Research: Exportação de Escalas e Pesquisas

## R1 — Onde gerar os arquivos: cliente ou servidor?
- **Decision**: No cliente (`platform/`).
- **Rationale**: Os dados já estão carregados nas telas e já passam por autorização no servidor; a exportação é só apresentação. Evita novo endpoint, DTOs e testes de servidor, e mantém "valores idênticos aos da tela" (FR-006). A geração local não envia dados a terceiros (princípio III).
- **Alternatives considered**: endpoints no NestJS que retornam o arquivo (mais código e mais superfície de RBAC, sem ganho para um arquivo individual); serviço externo (rejeitado por privacidade).

## R2 — Biblioteca para .xlsx
- **Decision**: `exceljs`, carregada com `import()` dinâmico.
- **Rationale**: mantida, tipada, permite largura de colunas e negrito, e roda no navegador.
- **Alternatives considered**: `xlsx` (SheetJS), cuja versão no npm está desatualizada e com avisos de segurança; `write-excel-file`, menor mas com menos controle de estilo; CSV, que não atende "Excel".

## R3 — Biblioteca para PDF
- **Decision**: `jspdf` + `jspdf-autotable`, import dinâmico.
- **Rationale**: texto real (selecionável), tabelas paginadas automaticamente, A4. A fonte padrão cobre os acentos do pt-BR.
- **Alternatives considered**: `html2canvas` + jsPDF (imagem rasterizada, ruim para impressão); `@react-pdf/renderer` (mais pesado, API própria); `window.print()` (sem arquivo nomeado).

## R4 — Exportar "todas as escalas ativas" (clarificação 2)
- **Decision**: reutilizar `schedulesService.list({ userId, isActive: true })` e incluir o título da escala em cada linha.
- **Rationale**: o endpoint existente já filtra por usuário e status; nenhuma mudança de API.
- **Alternatives considered**: filtrar no cliente a lista completa (mais dados trafegados).

## R5 — Ordenação dos turnos (FR-003)
- **Decision**: recorrentes por `dayOfWeek` 0–6, depois `customDate` ascendente; desempate por `startTime`.

## R6 — Pontuação da pesquisa
- **Decision**: usar `survey.answers` por `questionIndex` contra `PHQ9_QUESTIONS`, os rótulos de pontuação e `totalScore`/`severity` do próprio registro (sem recalcular). Pergunta sem resposta = "Sem resposta".
- **Rationale**: garante igualdade com a tela (FR-006). `SCORE_LABELS` hoje é local de `SurveysPage`; será movido para `surveys.service.ts` para reuso.

## R7 — Nome do arquivo (FR-009)
- **Decision**: `escala-<nome>-AAAA-MM-DD.<ext>` e `pesquisa-phq9-<nome>-AAAA-MM-DD.<ext>`, com acentos removidos e espaços trocados por hífen no nome do arquivo.
- **Rationale**: compatível com sistemas de arquivos; o conteúdo mantém os acentos.
