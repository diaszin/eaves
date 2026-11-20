# Contratos: Agendamentos por Paciente

## API (server) — endpoint novo

`GET /appointments/all`

- Autorização: `@Can(AppointmentsPolicy, 'view')` — mesmos papéis de `GET /appointments` (patient,
  professor, coordinator, lobby, trainee). Paciente recebe apenas os próprios agendamentos.
- Resposta `200`: array de agendamentos, **mesmo formato** de `GET /appointments`
  (`id`, `initialDate`, `endDate`, `patient`, `professional`, `createdBy`, com o `select` restrito de
  colunas de usuário), ordenado por `initialDate` decrescente, **sem limite de quantidade**.
- Declarar a rota antes de `GET /appointments/:id`.
- Swagger: `@ApiOkResponse` descrevendo a lista; sem DTO novo.

Inalterados: `GET /appointments` (continua limitado a 5 itens), `GET /appointments/:id`, `POST`,
`PATCH`, `DELETE`.

## Rotas do painel

| Rota | Comportamento |
|------|---------------|
| `/appointments` | Lista de pacientes à esquerda; painel direito vazio ("Selecione um paciente") |
| `/appointments/patient/:patientId` | Perfil: identificação, filtros e histórico |
| `/appointments/patient/:patientId?appointment=:id` | Igual, com o agendamento `:id` aberto no detalhe |
| `/appointments/:id` | Legado (FR-015): resolve o paciente dono do agendamento `:id` e redireciona para o perfil com ele aberto; id inexistente mostra "Agendamento não encontrado" |

## Contrato de UI

**Lista (painel esquerdo)**: uma linha por paciente com nome (ou e-mail), "N agendamentos" e
"Último: <data>"; item ativo destacado; busca por nome/e-mail; estados: carregando, erro (com "Tentar
novamente"), vazio ("Nenhum agendamento encontrado").

**Perfil (painel direito)**:
1. Cabeçalho: avatar, nome/e-mail, total de agendamentos.
2. Filtros: "De", "Até", "Profissional" (padrão "Todos"), "Limpar filtros"; aviso "A data inicial não
   pode ser posterior à final." quando inválido.
3. Histórico: itens do mais recente ao mais antigo com data, horário (`início - término`) e
   profissional; o item selecionado abre o detalhe existente (com "Cancelar Agendamento" para quem pode).
4. Vazio com filtros: "Nenhum agendamento encontrado para os filtros selecionados" + "Limpar filtros".

O botão "Novo Agendamento" e o formulário permanecem no cabeçalho da página. Textos em pt-BR.
