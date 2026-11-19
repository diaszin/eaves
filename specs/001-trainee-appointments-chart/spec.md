# Feature Specification: Gráfico de Agendamentos do Estagiário

**Feature Branch**: `001-trainee-appointments-chart`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "Implemente um gráfico de barras ao selecionar um estagiário na plataforma. Esse gráfico deverá conter os agendamentos que tem como profissional o estagiário"

## Clarifications

### Session 2026-11-18

- Q: O que cada barra do gráfico deve representar? → A: Quantidade de agendamentos por mês, nos últimos 6 meses
- Q: Quais perfis devem poder ver o gráfico de um estagiário? → A: Somente coordenador (revisado após /speckit-analyze; antes: coordenador e professor)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver a carga de atendimentos de um estagiário (Priority: P1)

Um coordenador na plataforma backoffice seleciona um estagiário na lista e vê, na área de detalhes, um gráfico de barras com a quantidade de agendamentos em que esse estagiário é o profissional, agrupados por mês.

**Why this priority**: É o objetivo central da funcionalidade: dar visão rápida da atividade do estagiário sem abrir a lista de agendamentos.

**Independent Test**: Selecionar um estagiário que possui agendamentos em vários meses e confirmar que o gráfico mostra uma barra por mês com a contagem correta.

**Acceptance Scenarios**:

1. **Given** um estagiário com agendamentos em meses diferentes, **When** o usuário o seleciona na lista, **Then** o gráfico de barras é exibido com uma barra por mês e a altura corresponde ao número de agendamentos do mês.
2. **Given** um gráfico exibido, **When** o usuário seleciona outro estagiário, **Then** o gráfico passa a mostrar apenas os agendamentos do novo estagiário.
3. **Given** um agendamento em que o estagiário é o paciente ou o criador, mas não o profissional, **When** o gráfico é calculado, **Then** esse agendamento não é contado.

---

### User Story 2 - Entender os valores do gráfico (Priority: P2)

O usuário passa o cursor (ou toca) sobre uma barra e vê o mês e o número exato de agendamentos; o gráfico tem título, eixos legíveis e rótulos em português.

**Why this priority**: Torna o gráfico interpretável, mas a visão geral já entrega valor sem isso.

**Independent Test**: Interagir com uma barra e verificar que o valor exato aparece.

**Acceptance Scenarios**:

1. **Given** o gráfico exibido, **When** o usuário interage com uma barra, **Then** vê o mês e a quantidade exata de agendamentos.

---

### User Story 3 - Estados sem dados ou com erro (Priority: P3)

Quando o estagiário não tem agendamentos, ou o carregamento falha, o usuário recebe uma mensagem clara em vez de um gráfico vazio ou quebrado.

**Why this priority**: Garante robustez, mas é secundário em relação ao gráfico com dados.

**Independent Test**: Selecionar um estagiário sem agendamentos e simular falha de carregamento.

**Acceptance Scenarios**:

1. **Given** um estagiário sem agendamentos no período, **When** o usuário o seleciona, **Then** vê uma mensagem informando que não há agendamentos.
2. **Given** uma falha ao carregar os dados, **When** o usuário seleciona o estagiário, **Then** vê uma mensagem de erro e o restante dos detalhes continua visível.

---

### Edge Cases

- Meses sem agendamentos dentro do período devem aparecer com barra de valor zero, para manter a linha do tempo contínua.
- Agendamentos no limite entre meses são contados pelo mês da data de início.
- Estagiário com grande volume de agendamentos: o gráfico continua legível com escala ajustada.
- Usuário que não seja coordenador não deve conseguir ver o gráfico nem os dados por outra via.
- Troca rápida entre estagiários não deve exibir dados do estagiário anterior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao selecionar um estagiário na plataforma, o sistema MUST exibir na área de detalhes um gráfico de barras de agendamentos.
- **FR-002**: O gráfico MUST contar somente agendamentos em que o estagiário selecionado é o profissional.
- **FR-003**: O gráfico MUST agrupar os agendamentos por mês da data de início, cobrindo os últimos 6 meses incluindo o mês corrente.
- **FR-004**: Meses sem agendamentos MUST aparecer com valor zero.
- **FR-005**: O sistema MUST mostrar o mês e a quantidade exata ao interagir com uma barra.
- **FR-006**: O sistema MUST atualizar o gráfico ao trocar de estagiário, sem exibir dados do anterior.
- **FR-007**: O sistema MUST exibir mensagem de estado vazio quando o estagiário não tiver agendamentos no período.
- **FR-008**: O sistema MUST exibir mensagem de erro, sem afetar o restante dos detalhes, quando os dados não puderem ser carregados.
- **FR-009**: O gráfico MUST ser acessível apenas ao perfil coordenador, e os dados MUST ser restritos a ele também no servidor; os demais perfis (professor, recepcionista, estagiário, paciente) MUST ser negados e a tela MUST NOT exibir o gráfico para eles (Constituição, Princípio II).
- **FR-010**: Todos os textos do gráfico MUST estar em português do Brasil.
- **FR-011**: O gráfico MUST expor apenas contagens agregadas, sem dados clínicos ou pessoais de pacientes (Constituição, Princípio III).

### Key Entities *(include if feature involves data)*

- **Estagiário**: usuário com perfil `trainee`; é o profissional selecionado.
- **Agendamento**: encontro com data de início, data de fim, paciente, profissional e criador; só os agendamentos com o estagiário como profissional entram no gráfico.
- **Contagem mensal**: agregação derivada (mês, quantidade) exibida em cada barra.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ao selecionar um estagiário, o gráfico é exibido em até 2 segundos em condições normais de rede.
- **SC-002**: 100% das barras exibem contagens iguais à contagem manual dos agendamentos do estagiário no mês correspondente.
- **SC-003**: Um usuário identifica, sem ajuda, o mês de maior atividade de um estagiário em menos de 10 segundos.
- **SC-004**: Nenhum agendamento em que o estagiário não é o profissional é contado.

## Assumptions

- Cada barra representa a quantidade de agendamentos por mês, nos últimos 6 meses (confirmado em Clarifications); filtros de período ficam fora do escopo.
- São contados todos os agendamentos do período, passados e futuros, independentemente de status, pois o modelo atual não tem campo de status.
- O gráfico aparece nos detalhes do estagiário na seção de usuários/estagiários da plataforma, que já existe.
- Somente o coordenador acessa o gráfico (confirmado em Clarifications); nenhum outro perfil ganha acesso à página de estagiários por esta feature.
- O aplicativo móvel está fora do escopo; a funcionalidade é só da plataforma backoffice.
- Depende dos dados existentes de agendamentos, que já registram o profissional.
