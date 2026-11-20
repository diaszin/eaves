# Contratos: Cancelar Agendamento

## API (server)

### `PATCH /appointments/:id/cancel`

- Autenticação: Bearer JWT.
- Autorização: `@Can(AppointmentsPolicy, 'cancel')` → `coordinator`, `lobby`, `patient`. Paciente só
  cancela agendamento em que ele é o paciente.
- Parâmetro: `id` (inteiro; não numérico → 400 via `ParseIntPipe`).
- Corpo: nenhum.

| Resposta | Quando | Corpo |
|----------|--------|-------|
| `200` | cancelado com sucesso | `{ "id": number, "status": "cancelled" }` |
| `400` | já cancelado: "O agendamento já está cancelado" | mensagem padrão do Nest |
| `400` | já encerrado: "Não é possível cancelar um agendamento já encerrado" | idem |
| `401` | sem autenticação | |
| `403` | papel não autorizado (professor, trainee) ou paciente tentando cancelar agendamento de outro paciente | |
| `404` | agendamento inexistente: "Agendamento não encontrado" | |

Concorrência: o cancelamento é uma atualização condicional (`status = scheduled`); se outro usuário
cancelou entre a leitura e a escrita, a resposta é `400` "já cancelado", nunca `500`.

Swagger: `@ApiOkResponse` com o formato acima e `@ApiBearerAuth` herdado do controller.

### Campo novo nas consultas

`GET /appointments`, `GET /appointments/all`, `GET /appointments/:id` e a resposta de `POST /appointments`
incluem `status` (`"scheduled"` | `"cancelled"`).

### Criação (efeito colateral)

`POST /appointments`: a verificação de conflito de horário do profissional ignora agendamentos
`cancelled`; conflitos com `scheduled` continuam retornando `400` "O profissional já possui um
agendamento nesse horário".

Inalterados: `PATCH /appointments/:id` (stub), `DELETE /appointments/:id`.

## Contrato de UI — painel

- **Detalhe**: selo de status (Agendado/Cancelado). "Cancelar Agendamento" só para quem pode cancelar
  (coordenador/lobby), com status ativo e término no futuro. Ao clicar: confirmação inline ("Confirmar
  cancelamento" / "Voltar"). Em erro: mensagem da API em vermelho, status anterior mantido.
- **Histórico do paciente**: cada item mostra o selo de status.
- **Painel inicial**: indicadores de hoje e próximos ignoram cancelados.

## Contrato de UI — aplicativo móvel

- Lista "Seus agendamentos": cada item mostra o selo "Agendado"/"Cancelado".
- Em itens ativos com término no futuro: botão "Cancelar" → confirmação inline ("Confirmar
  cancelamento" / "Voltar") → ao confirmar, chama o endpoint, atualiza a lista e mostra erro claro em
  caso de falha. Itens cancelados ou encerrados não mostram o botão.

Textos em pt-BR.
