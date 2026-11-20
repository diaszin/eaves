# Data Model: Cancelar Agendamento

## Appointment (entidade, alteração)

Campo novo; demais campos inalterados (`id`, `initialDate`, `endDate`, `notes`, `created`,
`createdBy`, `patient`, `professional`).

| Campo | Tipo | Regra |
|-------|------|-------|
| `status` | enum `AppointmentStatus` | **novo**; NOT NULL; padrão `scheduled`; valores `scheduled` e `cancelled` |

### AppointmentStatus

| Valor | Significado | Rótulo (pt-BR) |
|-------|-------------|----------------|
| `scheduled` | agendamento ativo (padrão; todos os existentes e os novos) | Agendado |
| `cancelled` | cancelado; terminal (sem reativação nesta entrega) | Cancelado |

### Transições

```text
scheduled --cancelar--> cancelled        (somente se endDate > agora)
cancelled  (terminal)
```

Cancelar exige: usuário coordenador, lobby ou paciente dono do agendamento; status `scheduled`;
`endDate` no futuro. Qualquer outra tentativa é recusada sem alterar dados.

## Migração

`server/src/migration/1794900000000-AdicionaStatusAoAgendamento.ts`: cria o tipo
`appointment_status_enum` com os dois valores e adiciona `appointment.status` como
`NOT NULL DEFAULT 'scheduled'` (as linhas existentes ficam `scheduled`). `down`: remove a coluna e o tipo.

## Visões derivadas (clientes)

| Derivado | Regra |
|----------|-------|
| Ativo | `status = scheduled` |
| Encerrado | `endDate <= agora` |
| Cancelável | ativo **e** não encerrado **e** papel autorizado (painel: coordenador/lobby; app: o próprio paciente) |
| Conflito de horário (servidor) | considera apenas agendamentos `scheduled` do mesmo profissional |

## Payload das consultas

`GET /appointments`, `GET /appointments/all` e `GET /appointments/:id` passam a incluir
`status: 'scheduled' | 'cancelled'`. O app antigo ignora o campo extra.
