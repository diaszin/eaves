# Feature Specification: Animação em Cascata dos Agendamentos da Página Inicial

**Feature Branch**: `009-home-appointment-cascade`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "faça a implementação de animação de entrada em cascata para a lista de agendamentos da página inicial em @app/"

## Clarifications

### Session 2026-11-20

- Q: Should appointment cards below the initially visible area animate when the patient scrolls to them? → A: Animate only cards visible on the first screen; show all others normally.
- Q: What visual effect should each appointment card use as it appears in the cascade? → A: Fade in while moving slightly upward.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrada sequencial dos agendamentos (Priority: P1)

Ao abrir a página inicial, o paciente vê os agendamentos apresentados um após o outro, de cima para baixo, em vez de todos surgirem ao mesmo tempo. Cada cartão aparece gradualmente enquanto se move levemente para cima. A sequência torna a lista mais fácil de acompanhar sem alterar o conteúdo nem as ações disponíveis.

**Why this priority**: A lista de agendamentos é o alvo direto da solicitação e a entrada em sequência é o valor principal da feature.

**Independent Test**: Abrir a página inicial com vários agendamentos e confirmar que os cartões aparecem de cima para baixo, em sequência, mantendo os mesmos dados e ações.

**Acceptance Scenarios**:

1. **Given** a página inicial foi aberta e há vários agendamentos, **When** a lista é exibida, **Then** os cartões visíveis surgem gradualmente enquanto se movem levemente para cima, em sequência de cima para baixo e com um intervalo perceptível entre eles.
2. **Given** a lista está entrando, **When** o paciente consulta os cartões, **Then** nomes, datas, horários, status e ações de cada agendamento permanecem inalterados.
3. **Given** há apenas um agendamento, **When** a lista é exibida, **Then** esse cartão aparece sem esperar por outros itens.

---

### User Story 2 - Uso contínuo da lista (Priority: P2)

O paciente pode continuar usando a página inicial durante e depois da entrada dos agendamentos. Atualizações da lista enquanto a página permanece aberta não fazem os cartões existentes repetirem a sequência.

**Why this priority**: A animação deve complementar a consulta sem interromper o acesso às informações ou às ações já existentes.

**Independent Test**: Abrir a página inicial, interagir com um agendamento durante a entrada e atualizar a lista; verificar que as ações continuam funcionando e os cartões existentes não reiniciam a animação.

**Acceptance Scenarios**:

1. **Given** a entrada dos cartões ainda está ocorrendo, **When** o paciente tenta rolar ou interagir com um cartão já visível, **Then** a interação continua disponível e funciona normalmente.
2. **Given** a página inicial continua aberta, **When** os dados dos agendamentos são atualizados, **Then** os cartões já exibidos não reiniciam a animação de entrada.
3. **Given** o paciente sai da página inicial e a abre novamente, **When** a lista é exibida, **Then** a sequência de entrada é executada uma vez para essa nova exibição.

---

### Edge Cases

- Se não houver agendamentos, a mensagem de lista vazia continua sendo exibida sem uma sequência de cartões.
- Enquanto os dados ainda estão carregando, nenhum cartão ou estado intermediário deve ser apresentado como se fosse um agendamento.
- Se a lista tiver somente um item, ele não deve sofrer atraso perceptível por causa da sequência.
- Ao rolar a lista, cartões já apresentados não devem repetir a animação por reaparecerem na área visível.
- Cartões abaixo da área inicialmente visível permanecem sem animação quando o paciente rola até eles.
- Com a preferência do dispositivo por movimento reduzido ativada, a entrada deve evitar deslocamentos e atrasos perceptíveis.
- A animação não deve impedir rolagem, cancelamento de agendamento ou qualquer outra interação existente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao exibir a lista de agendamentos na página inicial, o sistema MUST apresentar somente os cartões visíveis na primeira tela em uma sequência de entrada de cima para baixo, fazendo cada cartão surgir gradualmente enquanto se move levemente para cima; cartões abaixo dessa área MUST ser exibidos sem animação, inclusive quando alcançados por rolagem.
- **FR-002**: O início da entrada de cada cartão MUST ocorrer depois do cartão anterior, com um intervalo visual perceptível e consistente.
- **FR-003**: A sequência MUST ser executada uma vez por exibição da página inicial e MUST NOT reiniciar para cartões já apresentados por causa de atualização dos dados ou rolagem.
- **FR-004**: A animação MUST NOT alterar os dados, a ordem, o status ou as ações disponíveis nos cartões de agendamento.
- **FR-005**: Rolagem e ações disponíveis nos cartões MUST continuar utilizáveis enquanto a sequência de entrada ocorre.
- **FR-006**: Quando não houver agendamentos, a mensagem de lista vazia MUST permanecer disponível e não deve ser substituída por cartões animados.
- **FR-007**: Quando o dispositivo indicar preferência por movimento reduzido, o sistema MUST evitar movimento de deslocamento e espera em cascata.
- **FR-008**: A animação MUST completar a entrada dos cartões visíveis em até 1,5 segundo após a lista estar disponível.

### Key Entities

- **Agendamento exibido**: Item existente na lista da página inicial, com profissional, data, horário, status e ações disponíveis. A feature não adiciona nem altera dados do agendamento.
- **Lista de agendamentos da página inicial**: Conjunto ordenado de agendamentos que o paciente pode consultar e com o qual pode interagir.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% das exibições da página inicial com mais de um agendamento, os cartões visíveis entram em sequência de cima para baixo.
- **SC-002**: Em 100% das verificações, a entrada dos cartões visíveis termina em até 1,5 segundo após a lista estar disponível.
- **SC-003**: Em 10 de 10 verificações durante a animação, rolagem e ações disponíveis nos cartões continuam funcionando sem bloqueio.
- **SC-004**: Em 100% das atualizações ou rolagens feitas enquanto a página inicial permanece aberta, cartões já apresentados não reiniciam a animação.
- **SC-005**: Com movimento reduzido ativado, 0 cartões apresentam deslocamento ou espera escalonada.

## Assumptions

- O escopo é somente a lista de agendamentos exibida na página inicial do aplicativo em `app/`; outras listas e telas não mudam.
- A sequência ocorre nos cartões visíveis na primeira tela a cada nova abertura da página inicial. Cartões abaixo dessa área aparecem sem animação; atualizações e rolagens dentro da mesma exibição não reiniciam a sequência.
- A entrada em cascata é puramente visual: não altera busca, ordenação, carregamento, cancelamento ou navegação.
- A preferência de movimento reduzido do dispositivo é respeitada para evitar movimento desnecessário.
