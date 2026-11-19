# Contract: contagem mensal de agendamentos de um estagiário

## `GET /appointments/professionals/:professionalId/monthly-count`

Retorna a quantidade de agendamentos por mês, nos últimos 6 meses (incluindo o mês corrente), em que o
usuário informado é o profissional.

**Autenticação**: Bearer JWT (`JWT-auth`).

**Autorização**: apenas `coordinator` (policy `AppointmentsPolicy.viewProfessionalStats`).

**Nota**: o caminho tem 3 segmentos após `/appointments`, então não colide com `GET /appointments/:id` (que casa um único segmento); a ordem de declaração no controller não importa.

### Parâmetros

| Nome | Em | Tipo | Regra |
|------|----|------|-------|
| `professionalId` | path | inteiro | obrigatório; `ParseIntPipe` rejeita valores não numéricos com 400 |

### Resposta 200

```json
[
  { "month": "2026-06", "count": 0 },
  { "month": "2026-07", "count": 3 },
  { "month": "2026-08", "count": 5 },
  { "month": "2026-09", "count": 2 },
  { "month": "2026-10", "count": 7 },
  { "month": "2026-11", "count": 4 }
]
```

- Sempre 6 itens, ordem cronológica crescente.
- `month`: `YYYY-MM`; `count`: inteiro >= 0.
- Nenhum dado de paciente, nota ou criador.

### Erros

| Status | Quando |
|--------|--------|
| 400 | `professionalId` não numérico |
| 401 | sem token ou token inválido |
| 403 | perfil diferente de `coordinator` |
| 404 | usuário inexistente ou que não é `trainee` |

## Contrato de UI (plataforma)

Componente `TraineeAppointmentsChart({ traineeId })` exibido em `UserDetail` quando o usuário selecionado é `trainee` e o usuário logado é `coordinator` (nos demais casos nada é renderizado):

- Título "Agendamentos por mês" e subtítulo "Últimos 6 meses".
- Uma barra por mês; rótulo do eixo X em pt-BR abreviado (ex.: "nov/26"); valor exato visível ao passar o cursor ou focar a barra.
- Estados: carregando (spinner), vazio (todas as contagens 0: "Nenhum agendamento nos últimos 6 meses"), erro ("Não foi possível carregar o gráfico"), sem afetar o restante do detalhe.
- Alternativa textual para leitores de tela (`role="img"` com `aria-label` e lista de valores).
