# Data Model: Agendamentos Agrupados por Paciente

Sem alteração de schema nem migração. Tipos descrevem o contrato usado pelo painel; "derivado" =
calculado no cliente.

## Appointment (vindo da API)

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | number | |
| `initialDate` | string (ISO) | início; base do filtro de data e da ordenação |
| `endDate` | string (ISO) | término |
| `patient` | `{ id, email, role?, profile?: { fullname } }` | dono do agendamento |
| `professional` | `{ id, email, role?, profile?: { fullname } }` | **novo no tipo do painel** (a API já devolve); profissional responsável |
| `notes` | string \| null | só no detalhe |

O campo legado `therapist` do tipo do painel nunca é preenchido pela API; o painel lê
`professional ?? therapist`.

## PatientAppointmentSummary (derivado)

| Campo | Regra |
|-------|-------|
| `patientId` | `patient.id`; chave de agrupamento (uma entrada por paciente, SC-001) |
| `displayName` | `profile.fullname` ou, na ausência, `email` |
| `email` | `patient.email` |
| `appointmentCount` | número de agendamentos do paciente (todos, sem limite; SC-003) |
| `lastAppointmentAt` | maior `initialDate` entre os agendamentos |
| `appointments` | agendamentos do paciente, `initialDate` decrescente |

Ordenação da lista: `lastAppointmentAt` decrescente (FR-004). Busca: nome ou e-mail, sem diferenciar
maiúsculas (FR-003). Só existem pacientes com ao menos um agendamento.

## PatientAppointmentFilters (estado de UI, derivado)

| Campo | Tipo | Regra |
|-------|------|-------|
| `from` | `string \| ''` | data local `YYYY-MM-DD` de `initialDate`, inclusiva |
| `to` | `string \| ''` | idem, inclusiva |
| `professionalId` | `string \| ''` | `''` = todos; `String(professional.id)` |

Validação: com `from` e `to` preenchidos e `from > to`, o intervalo é inválido (FR-011): o filtro de
data não é aplicado e o aviso é exibido. Filtros combinam por E lógico (FR-010). Reiniciam ao trocar
de paciente.

## ProfessionalOption (derivado)

| Campo | Regra |
|-------|-------|
| `id` | `professional.id` |
| `label` | `profile.fullname` ou `email` |

Lista distinta de profissionais presentes nos agendamentos do paciente selecionado (FR-009). Agendamentos
sem profissional exibem "Profissional não informado" e não geram opção.
