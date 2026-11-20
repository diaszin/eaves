# Data Model: Pesquisas Agrupadas por Paciente

Sem alteração de schema nem migração. Os tipos abaixo descrevem o contrato de dados usado pelo
painel; "derivado" significa calculado no cliente.

## Survey (resposta, vinda da API)

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | number | id da primeira linha do dia; usado nas rotas de detalhe |
| `createdAt` | string (ISO) | data da resposta; base do filtro de data |
| `totalScore` | number | 0–27 |
| `severity` | `minimal \| mild \| moderate \| moderately_severe \| severe` | calculada no servidor |
| `category` | string | **novo** (aditivo): valor de `Survey.type`; hoje `'PHQ'` |
| `answers` | `{ questionIndex, question, score }[]` | detalhe por questão |
| `patient` | `{ id, email, profile?: { fullname } }` | dono da resposta |

## PatientSurveySummary (derivado)

| Campo | Regra |
|-------|-------|
| `patientId` | `patient.id`; chave de agrupamento (uma entrada por paciente, SC-001) |
| `displayName` | `profile.fullname` ou, na ausência, `email` |
| `email` | `patient.email` |
| `responseCount` | número de respostas do paciente |
| `lastResponseAt` | maior `createdAt` entre as respostas |
| `surveys` | respostas do paciente, `createdAt` decrescente |

Ordenação da lista: `lastResponseAt` decrescente (FR-004). Busca: nome ou e-mail, sem diferenciar
maiúsculas (FR-003). Só existem pacientes com ao menos uma resposta.

## PatientSurveyFilters (estado de UI, derivado)

| Campo | Tipo | Regra |
|-------|------|-------|
| `from` | `string \| ''` | data local `YYYY-MM-DD`, inclusiva |
| `to` | `string \| ''` | data local `YYYY-MM-DD`, inclusiva |
| `category` | `string \| ''` | `''` = todas |

Validação: se `from` e `to` preenchidos e `from > to`, o intervalo é inválido (FR-011): o filtro de
data não é aplicado e o aviso é exibido. Filtros combinam por E lógico (FR-009). Reiniciam ao trocar
de paciente.

## Categorias

| Valor da API | Rótulo exibido |
|--------------|----------------|
| `PHQ` | PHQ-9 |

Valores desconhecidos aparecem com o próprio valor como rótulo. O filtro lista apenas categorias
presentes nas respostas do paciente selecionado (FR-008).
