# Feature Specification: Pesquisas Agrupadas por Paciente

**Feature Branch**: `004-surveys-by-patient`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Em @platform/ mostre as pesquisas agrupada por pessoa ao invés de data, ai dentro do perfil do paciente mostre o filtro de data e categoria de pesquisa que quer visualizar"

## Clarifications

### Session 2026-11-20

- Q: Onde o perfil de pesquisas do paciente deve aparecer ao selecionar um paciente? → A: Dentro da própria página de Pesquisas: lista de pacientes à esquerda e perfil (histórico + filtros) no painel à direita; abrir uma resposta mostra o detalhe nesse mesmo painel.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver a lista de pacientes que responderam pesquisas (Priority: P1)

Um usuário do painel administrativo abre a página de Pesquisas e, em vez de uma lista de respostas ordenadas por data (uma linha por resposta), vê uma lista de pacientes — uma linha por pessoa — com um resumo de suas pesquisas (quantidade de respostas e data da resposta mais recente). Ao selecionar um paciente, abre o perfil de pesquisas dele.

**Why this priority**: É o núcleo do pedido: trocar o eixo de organização de "data" para "pessoa". Sem isso, as demais melhorias não têm onde acontecer.

**Independent Test**: Com pacientes que possuem várias respostas, abrir a página de Pesquisas e conferir que cada paciente aparece uma única vez, com o total de respostas e a data da última, e que a busca por nome continua funcionando.

**Acceptance Scenarios**:

1. **Given** um paciente com várias respostas registradas em datas diferentes, **When** o usuário abre a página de Pesquisas, **Then** o paciente aparece uma única vez na lista, com seu nome (ou e-mail, se não houver nome), o número de respostas e a data da resposta mais recente.
2. **Given** a lista de pacientes, **When** o usuário digita parte do nome ou e-mail na busca, **Then** apenas os pacientes correspondentes são exibidos.
3. **Given** a lista de pacientes, **When** exibida, **Then** os pacientes são ordenados pela resposta mais recente (do mais recente para o mais antigo) por padrão.
4. **Given** nenhum paciente com respostas, **When** o usuário abre a página, **Then** vê uma mensagem informando que não há pesquisas.

---

### User Story 2 - Ver o histórico de pesquisas dentro do perfil do paciente (Priority: P1)

Ao selecionar um paciente, o usuário vê o perfil dele com identificação (nome, e-mail) e o histórico de todas as pesquisas respondidas, da mais recente para a mais antiga. Cada item do histórico mostra data, pontuação total e classificação de gravidade, e pode ser aberto para ver as respostas por questão (comportamento de detalhe já existente, incluindo exportação).

**Why this priority**: Entrega o valor de consultar a evolução de uma pessoa ao longo do tempo, que a lista por data não permitia.

**Independent Test**: Selecionar um paciente com várias respostas e conferir que todas aparecem no perfil, em ordem cronológica decrescente, e que abrir uma delas mostra o detalhe por questão e a exportação.

**Acceptance Scenarios**:

1. **Given** um paciente selecionado, **When** o perfil é aberto, **Then** são exibidos seus dados de identificação e todas as suas respostas, cada uma com data, pontuação total e gravidade.
2. **Given** o histórico do paciente, **When** o usuário abre uma resposta, **Then** vê o detalhe por questão e pode exportá-la em Excel ou PDF, como já ocorre hoje.
3. **Given** um paciente que respondeu apenas uma vez, **When** o perfil é aberto, **Then** o histórico mostra essa única resposta sem erros.

---

### User Story 3 - Filtrar por período e categoria de pesquisa no perfil (Priority: P2)

Dentro do perfil do paciente, o usuário pode restringir o histórico por intervalo de datas (data inicial e/ou final) e por categoria de pesquisa (hoje, o questionário PHQ-9; futuramente outras categorias). O histórico exibido reflete imediatamente os filtros escolhidos, e é possível limpar os filtros.

**Why this priority**: Complementa a visão por pessoa permitindo focar em um período ou tipo de pesquisa; útil, mas o perfil já entrega valor sem filtros.

**Independent Test**: No perfil de um paciente com respostas em vários meses, aplicar um intervalo de datas e conferir que somente as respostas dentro do período aparecem; selecionar uma categoria e conferir que só respostas dela aparecem; limpar filtros e ver o histórico completo.

**Acceptance Scenarios**:

1. **Given** o perfil de um paciente, **When** o usuário define data inicial e final, **Then** somente as respostas dentro do intervalo (inclusive nas duas pontas) são exibidas.
2. **Given** o perfil de um paciente, **When** o usuário seleciona uma categoria de pesquisa, **Then** somente respostas dessa categoria são exibidas.
3. **Given** filtros de data e categoria aplicados juntos, **When** exibido o histórico, **Then** são mostradas apenas as respostas que atendem aos dois critérios.
4. **Given** filtros que não correspondem a nenhuma resposta, **When** aplicados, **Then** o usuário vê uma mensagem "Nenhuma pesquisa encontrada para os filtros selecionados" e uma ação para limpar filtros.
5. **Given** a data inicial posterior à data final, **When** o usuário tenta aplicar, **Then** o sistema impede ou sinaliza o intervalo inválido.
6. **Given** filtros aplicados, **When** o usuário seleciona outro paciente, **Then** os filtros são reiniciados para o padrão (sem filtro).

---

### Edge Cases

- Paciente sem nome de perfil: usar o e-mail como identificação na lista e no perfil.
- Paciente com grande quantidade de respostas: o histórico permanece navegável e os filtros continuam respondendo sem demora perceptível.
- Resposta aberta por link direto: ao acessar o endereço de uma resposta específica, o usuário vê o perfil do paciente dono dela com aquela resposta aberta.
- Fuso horário: a data de uma resposta, para fins de filtro, é a data local exibida ao usuário.
- Falha ao carregar: o usuário vê mensagem de erro clara e pode tentar novamente.
- Lista de categorias: apenas categorias em que o paciente possui respostas são oferecidas no filtro; com uma única categoria disponível, o filtro continua visível com uma só opção.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A página de Pesquisas MUST listar pacientes (uma entrada por pessoa) em vez de respostas individuais ordenadas por data.
- **FR-002**: Cada entrada da lista MUST exibir o nome do paciente (ou e-mail na ausência de nome), a quantidade de respostas e a data da resposta mais recente.
- **FR-003**: A lista MUST permitir busca por nome ou e-mail do paciente.
- **FR-004**: A lista MUST ser ordenada por padrão pela resposta mais recente, da mais recente para a mais antiga.
- **FR-005**: Ao selecionar um paciente, o sistema MUST exibir, no painel à direita da própria página de Pesquisas (mantendo a lista de pacientes visível à esquerda), o perfil de pesquisas dele, com identificação e histórico de todas as suas respostas em ordem cronológica decrescente.
- **FR-006**: Cada item do histórico MUST mostrar data, pontuação total e classificação de gravidade, e MUST permitir abrir o detalhe por questão e exportá-lo (Excel/PDF), preservando o comportamento atual.
- **FR-007**: O perfil MUST oferecer filtro por intervalo de datas (data inicial e/ou final, ambas opcionais, inclusivas).
- **FR-008**: O perfil MUST oferecer filtro por categoria de pesquisa, listando as categorias existentes para aquele paciente, com a opção "todas" como padrão.
- **FR-009**: Os filtros de data e categoria MUST poder ser combinados e MUST atualizar o histórico exibido imediatamente.
- **FR-010**: O sistema MUST oferecer ação para limpar os filtros e restaurar o histórico completo.
- **FR-011**: O sistema MUST sinalizar intervalo de datas inválido (inicial posterior à final).
- **FR-012**: O sistema MUST exibir estados claros de carregamento, vazio (sem pesquisas / sem resultados para os filtros) e erro.
- **FR-013**: O acesso à página e aos dados MUST seguir as mesmas regras de papéis já vigentes para Pesquisas; nenhum papel ganha acesso novo e o papel paciente continua sem acesso ao painel.
- **FR-014**: Um endereço direto para uma resposta específica MUST continuar funcionando, abrindo o perfil do paciente correspondente com a resposta selecionada.

### Key Entities *(include if feature involves data)*

- **Paciente**: pessoa que responde pesquisas; identificada por nome de perfil e e-mail; possui zero ou mais respostas.
- **Resposta de pesquisa**: registro de um questionário respondido por um paciente em uma data, com pontuação total, gravidade e respostas por questão.
- **Categoria de pesquisa**: tipo de questionário ao qual a resposta pertence (atualmente PHQ-9).
- **Resumo do paciente**: visão agregada por pessoa com total de respostas e data da última resposta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cada paciente aparece exatamente uma vez na lista, independentemente de quantas respostas tenha (0 duplicidades).
- **SC-002**: Um usuário encontra todas as pesquisas de um paciente específico em no máximo 2 interações (buscar e selecionar o paciente) a partir da página de Pesquisas.
- **SC-003**: Aplicar ou alterar um filtro de data ou categoria atualiza o histórico em menos de 1 segundo percebido para pacientes com até 500 respostas.
- **SC-004**: 100% das respostas exibidas com filtros ativos atendem aos critérios de data e categoria escolhidos, e nenhuma que os atenda é omitida.
- **SC-005**: As funcionalidades atuais de detalhe e exportação de uma resposta continuam disponíveis sem regressão.

## Assumptions

- Hoje o sistema possui apenas a categoria PHQ-9; o filtro de categoria acomoda novas categorias sem mudança de experiência, listando as que existirem para o paciente.
- O escopo é o painel administrativo (platform); o aplicativo móvel não é alterado.
- A lista exibe somente pacientes que têm ao menos uma resposta.
- O filtro de data considera a data de criação da resposta.
- A seleção de pacientes e o perfil usam o layout atual de lista à esquerda e conteúdo à direita, sem criar página separada nem alterar o perfil geral de usuários.
- Filtros não persistem entre pacientes nem entre sessões.
- Os dados necessários podem exigir ajustes no contrato de dados entre painel e API para agregação por paciente e filtragem; isso é decidido na fase de planejamento.
