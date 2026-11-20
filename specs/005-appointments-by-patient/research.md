# Research: Agendamentos Agrupados por Paciente

## Estado atual (verificado no código)

- `GET /appointments` (`@Can(AppointmentsPolicy, 'view')`) chama `AppointmentsService.findAll(user)`: `select` restrito (id, initialDate, endDate, patient/professional/createdBy com `allowedUserColumns`), ordenado por `initialDate DESC`, **`take: 5`** (commit `5bab980`); paciente só vê os seus. Usado pelo painel (`AppointmentsList`, `DashboardPage`) e pelo app móvel.
- `GET /appointments/:id` devolve o agendamento com `patient`, `professional`, `createdBy`.
- A API devolve o campo **`professional`**; o tipo `Appointment` do painel declara **`therapist`** (nunca preenchido), por isso "Terapeuta" aparece como "—" no detalhe.
- A entidade `Appointment` não tem coluna de status; `AppointmentsService.update` é um stub (`return "This action updates..."`) e o painel "cancela" enviando `PATCH {status:'cancelled'}`. Na prática o cancelamento não persiste.
- `select` da listagem não inclui `notes`; o detalhe (`findOne`) inclui.

## Decisões

### D1. Como obter todos os agendamentos (clarificação)

- **Decision**: manter `GET /appointments` com `take: 5` e criar `GET /appointments/all`, que devolve todos, com o mesmo `select`, a mesma ordenação, o mesmo escopo por papel (paciente só os seus) e a mesma policy.
- **Rationale**: honra a clarificação (listagem de 5 itens intacta para app móvel e painel inicial, FR-016) e dá ao painel o histórico completo (FR-005). Implementação: extrair a consulta de `findAll` para um método privado que aceita um limite opcional; `findAll` passa 5 e o novo método não passa limite — sem duplicar o `select`.
- **Alternatives considered**: remover o limite e limitar nos clientes (risco para o app móvel); parâmetro opcional `?limit` na mesma rota (mudaria o contrato existente e exige tratar o padrão); paginação (excessivo para a escala).

### D2. Rota do endpoint novo

- **Decision**: `GET /appointments/all`, declarada **antes** de `@Get(':id')`.
- **Rationale**: o Nest resolve por ordem de declaração; `:id` capturaria "all" e falharia o parse. Nome simples e coerente.
- **Alternatives considered**: `/appointments/history`, `/appointments/by-patient` (promete agregação que o servidor não faz).

### D3. Agregar no cliente

- **Decision**: agrupar por `patient.id` e filtrar no cliente, como na 004.
- **Rationale**: nenhuma regra de negócio nova; a lista completa já é suficiente para a escala (SC-004); evita DTOs e endpoints extras.
- **Alternatives considered**: agregação e filtros no servidor (mais código e contratos sem ganho nesta escala).

### D4. Filtro de profissional

- **Decision**: opções derivadas dos agendamentos do paciente, valor `professional.id`, rótulo `fullname` ou `email`; agendamento sem profissional aparece como "Profissional não informado" e só é excluído por um profissional específico.
- **Rationale**: a entidade não tem status/categoria; profissional é o segundo eixo disponível (assumption da spec).
- **Alternatives considered**: filtro de status (inexistente); filtro de "criado por" (não pedido).

### D5. Campo `professional` no cliente

- **Decision**: adicionar `professional` ao tipo `Appointment` do painel e usar `professional ?? therapist` no histórico e no detalhe; corrigir o rótulo do detalhe para "Profissional".
- **Rationale**: o histórico precisa mostrar o profissional (FR-007); sem isso o campo ficaria vazio. Correção mínima e compatível.
- **Alternatives considered**: renomear no servidor para `therapist` (quebraria o app móvel).

### D6. Cancelamento (fora do escopo)

- **Decision**: preservar o fluxo atual (botão no detalhe, `invalidateQueries(['appointments'])` ao concluir). Não corrigir o stub de `update` nem criar status.
- **Rationale**: a spec pede preservar o comportamento (FR-007, "ações já disponíveis hoje"); corrigir persistência é outra feature. A invalidação por prefixo `['appointments']` já atualiza lista, histórico e painel inicial sem recarga (FR-013).
- **Risk registrado**: como o cancelamento não persiste, o cenário US2/AC4 só será observável quando a persistência existir; o quickstart valida apenas que a UI recarrega os dados.

### D7. Navegação e rotas

- **Decision**: nova rota `appointments/patient/:patientId` com agendamento aberto via `?appointment=<id>`; `appointments/:id` permanece: a página resolve o paciente dono do agendamento pela lista completa e redireciona (`replace`). Após criar um agendamento, o fluxo atual navega para `/appointments/<id>`, que redireciona para o perfil (FR-013) após a invalidação da lista.
- **Rationale**: mesmo padrão da 004; deep links antigos continuam válidos (FR-015).
- **Alternatives considered**: estado local (perde deep link/refresh).

### D8. Datas e fuso

- **Decision**: filtrar e exibir pela data local do navegador de `initialDate`; extrair `toLocalDateKey` e `isDateRangeValid` para `platform/src/shared/utils/dateRange.ts` e fazer `patientSurveys.ts` importá-los.
- **Rationale**: evita duplicar lógica idêntica entre as features 004 e 005; a refatoração é pequena e coberta por build.
- **Alternatives considered**: copiar as funções (duplicação sem ganho).

### D9. Chaves de cache

- **Decision**: lista do painel em `['appointments', 'all']`; a listagem de 5 itens (painel inicial) continua em `['appointments']`; o detalhe em `['appointments', id]`.
- **Rationale**: chaves distintas porque os dados diferem (todos vs. 5); invalidar `['appointments']` invalida todas por prefixo.

## Questões abertas

Nenhuma.
