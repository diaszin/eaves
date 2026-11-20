# Data Model: Exportação

Sem alterações no banco ou na API. Modelo apenas de apresentação, no cliente.

## ExportDocument (novo, em memória)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `title` | string | Título do documento (ex.: "Escala de Estágio") |
| `fileBaseName` | string | Base do nome do arquivo, sem extensão |
| `meta` | `{ label, value }[]` | Cabeçalho (estagiário, período, status, paciente, data) |
| `tables` | `ExportTable[]` | Uma ou mais tabelas |
| `summary` | `{ label, value }[]` (opcional) | Totais (ex.: total e gravidade) |
| `generatedAt` | string | Data/hora de geração (pt-BR) |

## ExportTable

| Campo | Tipo |
|-------|------|
| `name` | string (nome da aba no Excel e subtítulo no PDF) |
| `columns` | string[] |
| `rows` | string[][] |

## Mapeamentos

**Schedule → ExportDocument** (colunas: Escala*, Dia, Início, Término, Local, Observações; *somente no modo "todas as escalas")
- `meta`: Estagiário (`user.profile.fullname` ou e-mail), Período (`startDate` a `endDate`, ou "sem data de término"), Status (Ativa/Inativa).
- Uma linha por `ScheduleShift`. Dia = nome do dia da semana ou data `dd/mm/aaaa` de `customDate`.

**Survey → ExportDocument** (colunas: Nº, Pergunta, Pontuação, Resposta)
- `meta`: Paciente (nome ou e-mail), Data da resposta (`createdAt`).
- Uma linha por pergunta de `PHQ9_QUESTIONS`. Pontuação vem de `answers[questionIndex].score`; Resposta é o rótulo da pontuação ou "Sem resposta".
- `summary`: Total (`totalScore` de 27) e Gravidade (`PHQ9_SEVERITY_LABELS[severity]`).
