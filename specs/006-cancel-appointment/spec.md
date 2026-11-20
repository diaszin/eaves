# Feature Specification: Cancelar Agendamento

**Feature Branch**: `006-cancel-appointment`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Implemente o \"Cancelar agendamento\". Altere a entidade para ter status de cancelled quando a pessoa cancelar a consulta"

## Contexto

Hoje o painel mostra o botão "Cancelar Agendamento" no detalhe de um agendamento, mas a ação **não faz nada**: o servidor não registra o cancelamento e os agendamentos não possuem status. Esta feature faz o cancelamento funcionar de ponta a ponta: o agendamento passa a ter um **status**, e cancelar o altera para **cancelado**, de forma persistente e visível para todos que consultam a agenda.

## Clarifications

### Session 2026-11-20

- Q: Quais papéis podem cancelar um agendamento? → A: Coordenador, recepção (lobby) e o próprio paciente (somente o agendamento dele); professor e estagiário não cancelam.
- Q: A tela de cancelar no aplicativo móvel deve entrar nesta entrega, para o paciente cancelar o próprio agendamento? → A: Sim; o aplicativo móvel ganha a ação "Cancelar" nos agendamentos do paciente, com confirmação e mensagem de erro, e passa a exibir o selo "Cancelado".

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cancelar um agendamento (Priority: P1)

Um usuário autorizado abre um agendamento no painel e aciona "Cancelar Agendamento". Após confirmar, o agendamento passa a constar como **Cancelado**, e isso permanece depois de recarregar a página.

**Why this priority**: É o pedido central: hoje a ação existe na tela mas não tem efeito.

**Independent Test**: Abrir um agendamento futuro ativo, cancelar, confirmar, recarregar a página e verificar que o agendamento continua marcado como Cancelado e sem o botão de cancelar.

**Acceptance Scenarios**:

1. **Given** um agendamento ativo que ainda não terminou, **When** um usuário autorizado aciona "Cancelar Agendamento" e confirma, **Then** o agendamento passa a ter o status Cancelado e o selo "Cancelado" aparece no detalhe.
2. **Given** a ação de cancelar acionada, **When** o sistema pede confirmação e o usuário desiste, **Then** nada é alterado.
3. **Given** um agendamento cancelado, **When** a página é recarregada ou o agendamento é consultado por outro usuário, **Then** ele continua como Cancelado.
4. **Given** um agendamento já cancelado, **When** o detalhe é exibido, **Then** o botão "Cancelar Agendamento" não aparece.
5. **Given** um agendamento cuja data de término já passou, **When** o detalhe é exibido, **Then** o cancelamento não é oferecido.
6. **Given** o cancelamento solicitado por alguém sem permissão (professor, estagiário ou outro usuário), **When** a requisição é feita, **Then** o sistema a recusa e o agendamento permanece inalterado.
7. **Given** um paciente autenticado e um agendamento dele ainda ativo, **When** ele solicita o cancelamento, **Then** o agendamento passa a Cancelado.
8. **Given** um paciente autenticado e um agendamento de **outro** paciente, **When** ele solicita o cancelamento, **Then** o sistema recusa e o agendamento permanece inalterado.
9. **Given** uma falha ao cancelar, **When** o usuário tenta, **Then** vê uma mensagem de erro clara e o agendamento permanece com o status anterior.

---

### User Story 2 - Ver o status dos agendamentos na agenda (Priority: P1)

Os agendamentos cancelados continuam no histórico do paciente, mas aparecem identificados como **Cancelado**, tanto na lista de histórico do perfil do paciente quanto no detalhe e no painel inicial. Agendamentos ativos aparecem como **Agendado**.

**Why this priority**: Sem exibir o status, o cancelamento seria invisível e a agenda ficaria enganosa (cancelado parecendo ativo).

**Independent Test**: Cancelar um agendamento e conferir que, no histórico do paciente, ele aparece como Cancelado enquanto os demais aparecem como Agendado; no painel inicial, o cancelado não conta como próximo atendimento.

**Acceptance Scenarios**:

1. **Given** um paciente com agendamentos ativos e cancelados, **When** o histórico é exibido, **Then** cada item mostra seu status (Agendado ou Cancelado) de forma distinguível.
2. **Given** um agendamento cancelado, **When** o painel inicial calcula os próximos atendimentos, **Then** o cancelado não é contado nem listado como próximo.
3. **Given** agendamentos criados antes desta feature, **When** exibidos, **Then** todos constam como Agendado (ativos), sem perda de dados.
4. **Given** o cancelamento concluído, **When** o usuário volta à lista de pacientes e ao histórico, **Then** os dados já refletem o novo status sem recarga manual.

---

### User Story 3 - Liberar o horário do profissional ao cancelar (Priority: P2)

Quando um agendamento é cancelado, o horário que ele ocupava volta a ficar disponível para o profissional: é possível criar um novo agendamento no mesmo horário sem que o cancelado cause conflito.

**Why this priority**: É a razão prática de cancelar; sem isso o horário ficaria bloqueado indefinidamente. Depende da US1.

**Independent Test**: Cancelar um agendamento e criar outro para o mesmo profissional no mesmo horário; a criação deve ser aceita.

**Acceptance Scenarios**:

1. **Given** um agendamento cancelado de um profissional, **When** um novo agendamento é criado para o mesmo profissional no mesmo horário, **Then** a criação é aceita.
2. **Given** um agendamento ativo no mesmo horário, **When** outro agendamento é criado para o mesmo profissional, **Then** o conflito continua sendo recusado como hoje.

---

### User Story 4 - Paciente cancela o próprio agendamento pelo aplicativo (Priority: P2)

No aplicativo móvel, o paciente vê seus agendamentos com o status (Agendado ou Cancelado). Em um agendamento ativo que ainda não terminou, ele aciona "Cancelar", confirma e o agendamento passa a Cancelado. Agendamentos cancelados aparecem identificados e sem a ação de cancelar.

**Why this priority**: Dá ao paciente a capacidade de cancelar que a permissão (FR-006) prevê; depende do cancelamento no servidor (US1).

**Independent Test**: No aplicativo, com um paciente que possui um agendamento futuro ativo, cancelar com confirmação e verificar que ele passa a constar como Cancelado no aplicativo e no painel.

**Acceptance Scenarios**:

1. **Given** o paciente com um agendamento ativo e futuro, **When** ele aciona "Cancelar" e confirma, **Then** o agendamento passa a Cancelado e a lista do aplicativo reflete isso sem recarga manual.
2. **Given** o paciente acionando "Cancelar", **When** ele desiste na confirmação, **Then** nada é alterado.
3. **Given** um agendamento cancelado ou encerrado, **When** a lista do aplicativo é exibida, **Then** o selo correspondente aparece e a ação "Cancelar" não é oferecida.
4. **Given** uma falha ao cancelar, **When** o paciente tenta, **Then** vê uma mensagem de erro clara e o agendamento permanece com o status anterior.
5. **Given** vários pacientes com agendamentos, **When** um paciente abre a lista no aplicativo, **Then** ele vê somente os próprios agendamentos.

---

### Edge Cases

- Cancelar um agendamento que já está cancelado: a ação é recusada com mensagem clara; o estado não muda.
- Cancelar um agendamento inexistente: mensagem de "agendamento não encontrado".
- Dois usuários cancelam o mesmo agendamento ao mesmo tempo: o resultado final é Cancelado e o segundo recebe a mensagem de que já estava cancelado, sem erro de sistema.
- Cancelamento de agendamento cujo término já passou: não permitido.
- Reverter um cancelamento (reativar): fora do escopo; um cancelado permanece cancelado e, se necessário, cria-se um novo agendamento.
- Aplicativo móvel: a lista do paciente mostra agendamentos cancelados identificados como Cancelado e sem a ação de cancelar; um cancelamento feito no painel aparece no aplicativo na próxima atualização da lista.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todo agendamento MUST possuir um status; os valores usados por esta feature são **agendado** (ativo, padrão) e **cancelado**.
- **FR-002**: Agendamentos já existentes MUST ser tratados como agendados (ativos) após a entrega, sem perda de dados.
- **FR-003**: Novos agendamentos MUST ser criados com o status agendado.
- **FR-004**: O sistema MUST permitir cancelar um agendamento ativo cujo término ainda não ocorreu, alterando seu status para cancelado de forma persistente.
- **FR-005**: O cancelamento MUST pedir confirmação do usuário antes de ser efetivado.
- **FR-006**: O cancelamento MUST ser permitido apenas para coordenador, recepção (lobby) e o paciente dono do agendamento (somente o próprio); professor, estagiário e qualquer outro usuário, assim como um paciente tentando cancelar agendamento de outro paciente, MUST ser recusados pelo servidor. A restrição MUST ser aplicada no servidor, não só na tela.
- **FR-007**: O sistema MUST recusar, com mensagem clara, o cancelamento de agendamento já cancelado, já encerrado ou inexistente, sem alterar dados.
- **FR-008**: O status do agendamento MUST ser retornado em todas as consultas de agendamentos (lista, lista completa e detalhe).
- **FR-009**: O detalhe do agendamento MUST exibir o selo do status (Agendado ou Cancelado) e MUST ocultar a ação de cancelar quando o agendamento estiver cancelado ou encerrado.
- **FR-010**: O histórico do paciente MUST continuar listando agendamentos cancelados, identificados como Cancelado, distinguíveis dos ativos.
- **FR-011**: Indicadores do painel inicial que se referem a atendimentos futuros MUST desconsiderar agendamentos cancelados.
- **FR-012**: Um agendamento cancelado MUST NOT gerar conflito de horário para o profissional ao criar um novo agendamento; conflitos com agendamentos ativos MUST continuar sendo recusados.
- **FR-013**: Após cancelar, a lista de pacientes, o histórico e o painel inicial MUST refletir o novo status sem recarga manual.
- **FR-014**: Falhas ao cancelar MUST exibir mensagem de erro clara, mantendo o agendamento com o status anterior.
- **FR-015**: O aplicativo móvel MUST exibir o status de cada agendamento do paciente (Agendado ou Cancelado) e MUST NOT tratar agendamentos cancelados como ativos.
- **FR-016**: O aplicativo móvel MUST oferecer ao paciente a ação "Cancelar" em seus agendamentos ativos que ainda não terminaram, com confirmação antes de efetivar, atualização da lista sem recarga manual e mensagem de erro clara em caso de falha; MUST NOT oferecer a ação em agendamentos cancelados ou encerrados.
- **FR-017**: O restante do comportamento do aplicativo móvel (criação e consulta de agendamentos) MUST continuar funcionando sem regressão.

### Key Entities *(include if feature involves data)*

- **Agendamento**: atendimento marcado para um paciente com um profissional, com início, término, observações opcionais e agora um **status** (agendado ou cancelado).
- **Status do agendamento**: situação do agendamento; "agendado" é o padrão e "cancelado" é terminal (não reversível nesta entrega).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos cancelamentos confirmados permanecem como Cancelado após recarregar a página e ao serem consultados por outro usuário.
- **SC-002**: Um usuário autorizado cancela um agendamento em no máximo 3 interações (abrir o agendamento, acionar cancelar, confirmar).
- **SC-003**: Após cancelar, o novo status aparece na tela (painel ou aplicativo) em até 2 segundos, sem recarga manual.
- **SC-004**: 100% das tentativas de cancelamento por usuários sem permissão (inclusive paciente sobre agendamento de outro paciente) são recusadas e não alteram nenhum agendamento; 100% dos cancelamentos do paciente sobre o próprio agendamento são aceitos.
- **SC-008**: Um paciente cancela um agendamento no aplicativo em no máximo 3 interações (abrir a lista, acionar "Cancelar", confirmar), e nenhum agendamento cancelado é exibido como ativo no aplicativo.
- **SC-005**: Após o cancelamento, um novo agendamento no mesmo horário do mesmo profissional é aceito em 100% dos casos; conflitos com agendamentos ativos continuam recusados em 100% dos casos.
- **SC-006**: 100% dos agendamentos existentes antes da entrega permanecem consultáveis e constam como Agendado.
- **SC-007**: Nenhum agendamento cancelado aparece como "próximo atendimento" no painel inicial.

## Assumptions

- O cancelamento é **definitivo**: não há reativação nesta entrega.
- O escopo de status é mínimo: apenas agendado e cancelado. Outros estados (confirmado, concluído, ausente) já têm rótulos na interface mas **não** serão registrados nesta feature.
- Cancelar não exige motivo nem registra quem cancelou ou quando; isso pode ser tratado em uma evolução futura.
- Agendamentos cancelados são mantidos na agenda e no histórico (não são excluídos), apenas identificados.
- Cancelamento de agendamento já encerrado não é permitido, pois não faz sentido cancelar algo que já ocorreu.
- O cancelamento tem dois pontos de entrada nesta entrega: o painel administrativo (coordenador e recepção) e o aplicativo móvel (paciente, apenas os próprios agendamentos), conforme FR-006 e FR-016.
- Notificações a paciente ou profissional sobre o cancelamento estão fora do escopo.
- A contagem de agendamentos por paciente na lista do painel continua incluindo os cancelados (a lista é de histórico).
- Esta feature depende e estende [005-appointments-by-patient](../005-appointments-by-patient/spec.md), que passa a exibir o status real em vez do padrão atual.
