# Contrato de UI: Exportação

Sem endpoints novos. Reutiliza `GET /schedules?userId&isActive`, `GET /schedules/:id` e
`GET /survey/phq/daily/responses/:id`.

## Componente `ExportMenu`

Props: `onExport(format: 'xlsx' | 'pdf'): Promise<void>`, `disabled?: boolean`.
- Dois botões: "Exportar Excel" e "Exportar PDF".
- Durante a geração, o botão mostra estado de carregamento e o outro fica desabilitado (FR-008).
- Falha: mensagem "Não foi possível gerar o arquivo. Tente novamente." (FR-008).

## Escala (`SchedulesPage` → `ScheduleDetailView`)
- Botões no cabeçalho do detalhe, visíveis para todos os papéis que veem a escala (não só `canManage`).
- Escolha de escopo (FR-002a): "Esta escala" ou "Todas as escalas ativas do estagiário".
- Sem turnos no escopo escolhido: mensagem "Não há horários para exportar." e nenhum arquivo (FR-007).

## Pesquisa (`SurveysPage` → `SurveyDetail`)
- Botões no cabeçalho do detalhe.
- O arquivo contém exatamente `totalScore` e `severity` do registro.

## Arquivos gerados
- `.xlsx`: uma aba por tabela, cabeçalho em negrito, larguras ajustadas.
- PDF A4: título, metadados, tabela(s) paginada(s), totais, data de geração.
- Nomes: ver [research.md](../research.md), R7.
