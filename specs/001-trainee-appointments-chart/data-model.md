# Data Model: Gráfico de Agendamentos do Estagiário

Nenhuma entidade nem coluna nova; nenhuma migration. A feature só lê dados existentes.

## Entidades existentes usadas

- **User** (`role = trainee`): o profissional selecionado. Campo usado: `id`.
- **Appointment**: campos usados `initialDate` (timestamptz) e `professional` (relação para `User`). Os campos `patient`, `createdBy` e `notes` NÃO são lidos nem retornados.

## Estrutura derivada (não persistida)

**MonthlyAppointmentCount**

| Campo | Tipo | Regra |
|-------|------|-------|
| `month` | string `YYYY-MM` | mês de `initialDate` no fuso `America/Bahia` |
| `count` | inteiro >= 0 | agendamentos com o estagiário como `professional` naquele mês |

**Regras de validação e consistência**

- A resposta tem sempre exatamente 6 itens, em ordem cronológica crescente, do mês corrente menos 5 até o mês corrente.
- Meses sem agendamentos têm `count = 0` (FR-004).
- Um agendamento conta uma vez, no mês de `initialDate` (borda de mês, edge case da spec).
- Um agendamento em que o estagiário é apenas paciente ou criador não é contado (FR-002).
- `professionalId` inexistente, ou de usuário que não é `trainee`, resulta em 404.

## Transições de estado

Não se aplica: os dados são somente leitura.
