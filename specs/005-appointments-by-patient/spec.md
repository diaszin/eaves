# Feature Specification: Agendamentos Agrupados por Paciente

**Feature Branch**: `005-appointments-by-patient`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Faça a mesma implementação de agregação para agendamentos"

## Contexto

Esta feature replica para **Agendamentos** o modelo entregue em [004-surveys-by-patient](../004-surveys-by-patient/spec.md): a lista deixa de ser uma sequência de registros ordenados por data e passa a mostrar **uma linha por paciente**; ao selecionar o paciente, o painel direito exibe o perfil com o histórico de agendamentos e filtros. Como agendamentos não têm "categoria" nem "status" registrados, o segundo filtro equivalente é o **profissional** responsável pelo atendimento.

## Clarifications

### Session 2026-11-20

- Q: Como o painel deve obter todos os agendamentos, já que a API hoje devolve no máximo 5? → A: A listagem atual com 5 itens permanece para quem já a usa (app móvel e painel inicial); o painel de Agendamentos passa a usar uma consulta separada que devolve todos os agendamentos, com os mesmos controles de acesso por papel.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver a lista de pacientes com agendamentos (Priority: P1)

Um usuário do painel administrativo abre a página de Agendamentos e, em vez de uma lista de agendamentos ordenados por data (um por linha), vê uma lista de pacientes — uma linha por pessoa — com um resumo (quantidade de agendamentos e data do agendamento mais recente). Ao selecionar um paciente, abre o perfil de agendamentos dele.

**Why this priority**: É o núcleo do pedido: trocar o eixo de organização de "data" para "pessoa", como já feito em Pesquisas.

**Independent Test**: Com pacientes que possuem vários agendamentos, abrir a página de Agendamentos e conferir que cada paciente aparece uma única vez, com o total de agendamentos e a data do mais recente, e que a busca por nome continua funcionando.

**Acceptance Scenarios**:

1. **Given** um paciente com vários agendamentos em datas diferentes, **When** o usuário abre a página de Agendamentos, **Then** o paciente aparece uma única vez na lista, com seu nome (ou e-mail, se não houver nome), o número de agendamentos e a data do agendamento mais recente.
2. **Given** a lista de pacientes, **When** o usuário digita parte do nome ou e-mail na busca, **Then** apenas os pacientes correspondentes são exibidos.
3. **Given** a lista de pacientes, **When** exibida, **Then** os pacientes são ordenados pelo agendamento mais recente (do mais recente para o mais antigo) por padrão.
4. **Given** um paciente com mais de 5 agendamentos, **When** a lista é exibida, **Then** o número de agendamentos e o histórico do paciente refletem todos os seus agendamentos, sem truncamento.
5. **Given** nenhum agendamento cadastrado, **When** o usuário abre a página, **Then** vê uma mensagem informando que não há agendamentos.

---

### User Story 2 - Ver o histórico de agendamentos dentro do perfil do paciente (Priority: P1)

Ao selecionar um paciente, o usuário vê o perfil dele com identificação (nome, e-mail) e o histórico de todos os agendamentos, do mais recente para o mais antigo. Cada item mostra data, horário e profissional, e pode ser aberto para ver o detalhe completo do agendamento (comportamento já existente, incluindo cancelamento para quem tem permissão).

**Why this priority**: Entrega o valor de consultar a agenda de uma pessoa ao longo do tempo, que a lista por data não permitia.

**Independent Test**: Selecionar um paciente com vários agendamentos e conferir que todos aparecem no perfil em ordem cronológica decrescente, e que abrir um deles mostra o detalhe e as ações já existentes.

**Acceptance Scenarios**:

1. **Given** um paciente selecionado, **When** o perfil é aberto, **Then** são exibidos seus dados de identificação e todos os seus agendamentos, cada um com data, horário e profissional.
2. **Given** o histórico do paciente, **When** o usuário abre um agendamento, **Then** vê o detalhe e as ações já disponíveis hoje conforme seu papel (por exemplo, cancelar), no mesmo painel.
3. **Given** um paciente com um único agendamento, **When** o perfil é aberto, **Then** o histórico mostra esse agendamento sem erros.
4. **Given** um agendamento cancelado pelo usuário no detalhe, **When** a ação é concluída, **Then** o histórico e a lista de pacientes refletem a mudança sem recarregar manualmente.
5. **Given** um novo agendamento criado pelo formulário existente, **When** a criação é concluída, **Then** o paciente (novo ou já existente) aparece na lista com o contador atualizado e o perfil abre com o novo agendamento selecionado.

---

### User Story 3 - Filtrar por período e profissional no perfil (Priority: P2)

Dentro do perfil do paciente, o usuário pode restringir o histórico por intervalo de datas (data inicial e/ou final) e por profissional (entre os que atenderam aquele paciente). O histórico reflete imediatamente os filtros e é possível limpá-los.

**Why this priority**: Permite focar em um período ou em um profissional; útil, mas o perfil já entrega valor sem filtros.

**Independent Test**: No perfil de um paciente com agendamentos em vários meses e com mais de um profissional, aplicar um intervalo e conferir que só os agendamentos do período aparecem; selecionar um profissional e conferir que só os dele aparecem; limpar e ver o histórico completo.

**Acceptance Scenarios**:

1. **Given** o perfil de um paciente, **When** o usuário define data inicial e final, **Then** somente os agendamentos dentro do intervalo (inclusive nas duas pontas) são exibidos.
2. **Given** o perfil de um paciente, **When** o usuário seleciona um profissional, **Then** somente agendamentos desse profissional são exibidos.
3. **Given** filtros de data e profissional aplicados juntos, **When** exibido o histórico, **Then** são mostrados apenas os agendamentos que atendem aos dois critérios.
4. **Given** filtros sem correspondência, **When** aplicados, **Then** o usuário vê "Nenhum agendamento encontrado para os filtros selecionados" e uma ação para limpar filtros.
5. **Given** a data inicial posterior à final, **When** o usuário tenta aplicar, **Then** o sistema sinaliza o intervalo inválido.
6. **Given** filtros aplicados, **When** o usuário seleciona outro paciente, **Then** os filtros são reiniciados para o padrão (sem filtro).

---

### Edge Cases

- Paciente sem nome de perfil: usar o e-mail como identificação na lista e no perfil.
- Paciente com grande quantidade de agendamentos: o histórico permanece navegável e os filtros respondem sem demora perceptível.
- Agendamento aberto por link direto: ao acessar o endereço de um agendamento específico, o usuário vê o perfil do paciente dono dele com aquele agendamento aberto.
- Fuso horário: a data de um agendamento, para fins de filtro e exibição, é a data local mostrada ao usuário.
- Agendamento sem profissional ou sem nome de profissional: aparece no histórico com indicação "Profissional não informado" e só é excluído por um filtro de profissional específico.
- Falha ao carregar: o usuário vê mensagem de erro clara e pode tentar novamente.
- Lista de profissionais no filtro: apenas profissionais que atenderam o paciente selecionado são oferecidos; com um único profissional, o filtro continua visível com uma só opção.
- Usuário com papel paciente (se tiver acesso aos agendamentos): continua vendo somente os próprios agendamentos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A página de Agendamentos MUST listar pacientes (uma entrada por pessoa) em vez de agendamentos individuais ordenados por data.
- **FR-002**: Cada entrada da lista MUST exibir o nome do paciente (ou e-mail na ausência de nome), a quantidade de agendamentos e a data do agendamento mais recente.
- **FR-003**: A lista MUST permitir busca por nome ou e-mail do paciente.
- **FR-004**: A lista MUST ser ordenada por padrão pelo agendamento mais recente, do mais recente para o mais antigo.
- **FR-005**: A contagem, o histórico e a data mais recente de cada paciente MUST considerar **todos** os agendamentos dele, sem limite de quantidade; para isso, a página de Agendamentos MUST obter os dados por uma consulta própria que devolve todos os agendamentos, sem alterar a listagem de 5 itens usada por outras telas.
- **FR-006**: Ao selecionar um paciente, o sistema MUST exibir, no painel à direita da própria página de Agendamentos (mantendo a lista de pacientes visível à esquerda), o perfil dele com identificação e histórico de todos os seus agendamentos em ordem cronológica decrescente.
- **FR-007**: Cada item do histórico MUST mostrar data, horário e profissional, e MUST permitir abrir o detalhe do agendamento com as mesmas informações e ações disponíveis hoje (incluindo cancelamento para os papéis que já podem cancelar).
- **FR-008**: O perfil MUST oferecer filtro por intervalo de datas (data inicial e/ou final, ambas opcionais, inclusivas).
- **FR-009**: O perfil MUST oferecer filtro por profissional, listando os profissionais que atenderam aquele paciente, com a opção "todos" como padrão.
- **FR-010**: Os filtros MUST poder ser combinados e MUST atualizar o histórico imediatamente; MUST existir ação para limpar os filtros.
- **FR-011**: O sistema MUST sinalizar intervalo de datas inválido (inicial posterior à final).
- **FR-012**: O sistema MUST exibir estados claros de carregamento, vazio (sem agendamentos / sem resultados para os filtros) e erro, com opção de tentar novamente em caso de falha.
- **FR-013**: Criar ou cancelar um agendamento MUST atualizar a lista de pacientes e o histórico sem recarga manual; após criar, o perfil do paciente MUST abrir com o novo agendamento selecionado.
- **FR-014**: O acesso à página e aos dados MUST seguir as mesmas regras de papéis já vigentes para Agendamentos; nenhum papel ganha acesso novo e cada papel continua vendo somente o que já pode ver hoje.
- **FR-015**: Um endereço direto para um agendamento específico MUST continuar funcionando, abrindo o perfil do paciente correspondente com o agendamento selecionado.
- **FR-016**: Outras telas que dependem da lista atual de agendamentos (por exemplo, indicadores do painel inicial) e o aplicativo móvel MUST continuar recebendo e exibindo os mesmos dados que exibem hoje (listagem de 5 itens inalterada), sem regressão.

### Key Entities *(include if feature involves data)*

- **Paciente**: pessoa atendida; identificada por nome de perfil e e-mail; possui zero ou mais agendamentos.
- **Agendamento**: atendimento marcado para um paciente com um profissional, com data/hora de início e término e observações opcionais.
- **Profissional**: estagiário responsável pelo atendimento do agendamento.
- **Resumo do paciente**: visão agregada por pessoa com total de agendamentos e data do mais recente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cada paciente aparece exatamente uma vez na lista, independentemente de quantos agendamentos tenha (0 duplicidades).
- **SC-002**: Um usuário encontra todos os agendamentos de um paciente específico em no máximo 2 interações (buscar e selecionar o paciente) a partir da página de Agendamentos.
- **SC-003**: Para um paciente com 6 ou mais agendamentos, 100% deles aparecem no histórico e a contagem exibida é igual ao total real.
- **SC-004**: Aplicar ou alterar um filtro atualiza o histórico em menos de 1 segundo percebido para pacientes com até 500 agendamentos.
- **SC-005**: 100% dos agendamentos exibidos com filtros ativos atendem aos critérios escolhidos, e nenhum que os atenda é omitido.
- **SC-006**: Detalhe, criação e cancelamento de agendamento, o painel inicial e o aplicativo móvel continuam funcionando sem regressão.

## Assumptions

- O agrupamento é **por paciente**, igual ao de Pesquisas; agrupar por profissional está fora do escopo.
- Agendamentos não possuem status ou categoria registrados; por isso o segundo filtro do perfil é o **profissional** (equivalente à "categoria" de Pesquisas). Um filtro por status só seria possível se o status passasse a ser registrado, o que está fora do escopo.
- O escopo é o painel administrativo (platform); o aplicativo móvel não muda de comportamento.
- A API hoje devolve no máximo 5 agendamentos na listagem existente, o que impediria cumprir FR-005 e SC-003. Decisão: essa listagem permanece inalterada (FR-016) e o painel de Agendamentos usa uma consulta separada que devolve todos, com as mesmas regras de acesso por papel.
- A lista exibe somente pacientes que têm ao menos um agendamento.
- O filtro de data considera a data de início do agendamento, no fuso local do usuário.
- A seleção de pacientes e o perfil usam o layout atual de lista à esquerda e conteúdo à direita, sem criar página separada.
- Filtros não persistem entre pacientes nem entre sessões.
- O formulário de novo agendamento e o fluxo de cancelamento permanecem como estão hoje.
