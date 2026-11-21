# Feature Specification: Microinterações nos Botões de Ação

**Feature Branch**: `010-button-micro-interactions`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "aplique microinterações em todos os botões em @app/ que resultem em um ação"

## Clarifications

### Session 2026-11-20

- Q: O toque deve gerar também vibração leve (feedback tátil)? → A: Não; feedback somente visual, sem vibração e sem som.
- Q: A barra de abas e os botões do cabeçalho de navegação entram na microinteração? → A: Sim, apenas os que o app já personaliza; componentes padrão de navegação não personalizados ficam fora.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Resposta visual ao toque nos botões principais (Priority: P1)

Ao tocar (ou clicar) em qualquer botão que dispare uma ação — entrar, cadastrar, salvar, confirmar, agendar, cancelar, enviar respostas, avançar etapas — o usuário percebe imediatamente uma resposta visual sutil: o botão "afunda" levemente enquanto está pressionado e retorna suavemente ao soltar. Isso confirma que o toque foi reconhecido antes mesmo de a ação terminar.

**Why this priority**: Os botões de ação são o principal ponto de interação do app; o feedback imediato ao toque é o núcleo da microinteração e entrega valor sozinho.

**Independent Test**: Abrir cada tela com botões de ação (login, cadastro, agendamento, diário, questionários, perfil), pressionar e soltar cada botão e confirmar a resposta visual de pressão e retorno.

**Acceptance Scenarios**:

1. **Given** uma tela com um botão de ação habilitado, **When** o usuário pressiona o botão, **Then** o botão exibe de imediato uma resposta visual de pressão (leve redução de escala e/ou mudança de opacidade).
2. **Given** o botão está pressionado, **When** o usuário solta o dedo/cursor, **Then** o botão retorna ao estado normal de forma suave e a ação associada é executada exatamente como antes.
3. **Given** o usuário pressiona o botão e arrasta o dedo para fora antes de soltar, **When** solta fora da área do botão, **Then** o botão retorna ao estado normal e a ação não é disparada.

---

### User Story 2 - Feedback de estados do botão (Priority: P2)

Botões que passam por estados distintos (carregando, desabilitado, concluído) comunicam essas mudanças com transições suaves, em vez de trocas bruscas. Quando uma ação está em andamento, o botão indica o processamento; quando está desabilitado, parece claramente inativo e não responde ao toque com a animação de pressão.

**Why this priority**: Evita toques repetidos e dúvidas sobre se a ação foi registrada, complementando o feedback básico de pressão.

**Independent Test**: Acionar um botão que dispara uma operação demorada (ex.: login ou salvar perfil) e verificar a transição para o estado de carregamento e de volta; verificar um botão desabilitado.

**Acceptance Scenarios**:

1. **Given** um botão de ação que inicia uma operação, **When** a operação está em andamento, **Then** o botão exibe o estado de carregamento com transição suave e não aceita novo toque até concluir.
2. **Given** um botão desabilitado, **When** o usuário toca nele, **Then** nenhuma animação de pressão é exibida e nenhuma ação é disparada.
3. **Given** a operação termina, **When** o botão sai do estado de carregamento, **Then** ele retorna ao estado normal de forma suave.

---

### User Story 3 - Itens tocáveis de lista, cartões e seletores (Priority: P3)

Elementos que funcionam como botões de ação, ainda que não pareçam botões tradicionais — itens do menu de perfil, cartões de agendamento/profissional/diário, botões de emoção, horários, opções de resposta de questionário e ícones de ação na barra de navegação — recebem a mesma linguagem de resposta ao toque, de forma consistente com os botões principais.

**Why this priority**: Garante consistência em todo o app, mas cada item tem menor destaque que os botões principais.

**Independent Test**: Percorrer menu de perfil, lista de agendamentos, diário, seleção de horário e questionário, tocando em cada elemento tocável e confirmando a resposta visual consistente.

**Acceptance Scenarios**:

1. **Given** um item tocável de lista ou cartão que leva a uma ação ou tela, **When** o usuário o pressiona, **Then** ele exibe resposta visual de pressão proporcional ao seu tamanho (mais sutil em elementos grandes).
2. **Given** um seletor (emoção, horário, opção de resposta), **When** o usuário o seleciona, **Then** a mudança para o estado "selecionado" ocorre com transição suave.

---

### User Story 4 - Respeito a preferências de acessibilidade (Priority: P3)

Usuários que ativaram a opção do sistema para reduzir movimento recebem feedback de toque simplificado (sem escala/movimento, apenas mudança sutil de opacidade ou cor), e o feedback nunca depende apenas de movimento para ser percebido.

**Why this priority**: Requisito de acessibilidade que protege usuários sensíveis a movimento, sem impedir o restante da feature.

**Independent Test**: Ativar "reduzir movimento" no dispositivo/navegador e pressionar botões variados; confirmar ausência de movimento e presença de feedback alternativo.

**Acceptance Scenarios**:

1. **Given** a preferência de reduzir movimento está ativa, **When** o usuário pressiona um botão, **Then** não há animação de escala; o feedback é dado por mudança sutil de opacidade/cor.

---

### Edge Cases

- Toques muito rápidos e repetidos: a animação não acumula nem deixa o botão preso em estado pressionado; a ação não é disparada mais de uma vez enquanto o botão está em carregamento.
- Botão pressionado e a tela muda (navegação) no meio do toque: nenhum estado visual residual permanece ao retornar.
- Pressão longa (segurar): o botão permanece no estado pressionado até soltar, sem repetir a animação.
- Botões muito pequenos (ícones): o efeito de escala é sutil o bastante para não gerar deslocamento perceptível do layout vizinho.
- Botões dentro de rolagem: iniciar uma rolagem sobre o botão cancela o estado pressionado sem disparar a ação.
- Uso na versão web com mouse: há feedback ao passar o cursor (hover) além do feedback de clique, sem prejudicar o uso por toque.
- Botões desabilitados ou apenas decorativos (sem ação) não recebem microinteração.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todo botão ou elemento tocável do aplicativo que dispare uma ação (envio de formulário, navegação, seleção, confirmação, cancelamento, abertura de menu/modal) MUST exibir resposta visual de pressão imediata ao ser tocado.
- **FR-002**: A resposta de pressão MUST ser reversível: ao soltar ou cancelar o toque, o elemento MUST retornar ao estado normal com transição suave.
- **FR-003**: A microinteração MUST NOT alterar a ação associada ao botão, seu texto, seu destino nem a ordem/posição dos demais elementos da tela.
- **FR-004**: Botões com operação em andamento MUST indicar estado de carregamento com transição suave e MUST NOT permitir novo acionamento até a conclusão.
- **FR-005**: Botões desabilitados MUST apresentar aparência de inativo e MUST NOT exibir a resposta de pressão nem disparar ações.
- **FR-006**: Mudanças de estado de seletores (selecionado/não selecionado) MUST ocorrer com transição suave em vez de troca instantânea.
- **FR-007**: A intensidade da microinteração MUST ser proporcional ao tamanho do elemento: botões grandes e cartões usam efeito mais discreto que botões pequenos e ícones, mantendo uma linguagem visual única em todo o app.
- **FR-008**: O sistema MUST respeitar a preferência de reduzir movimento do dispositivo, substituindo animações de escala por feedback sem movimento.
- **FR-009**: A microinteração MUST funcionar de forma equivalente nas plataformas suportadas (Android, iOS e web), incluindo feedback de hover na web.
- **FR-010**: A microinteração MUST ser aplicada de forma consistente a todos os botões de ação existentes nas áreas de autenticação, cadastro, agendamentos, profissionais, diário pessoal, questionários, perfil e barras de navegação (nos limites do FR-014). Links de texto embutidos em frases não são botões e ficam excluídos desta regra (ver Assumptions). Os modais/bottom sheets de sucesso e erro não possuem botões hoje; se ganharem botões de ação, estes MUST seguir a mesma regra.
- **FR-011**: Novos botões de ação adicionados futuramente MUST poder adotar a mesma microinteração de forma padronizada, sem reimplementar o comportamento.
- **FR-012**: A microinteração MUST NOT causar perceptível queda de fluidez na rolagem ou na navegação, nem atraso na execução da ação.
- **FR-013**: O feedback de toque MUST ser exclusivamente visual; o sistema MUST NOT emitir vibração nem som ao acionar botões.
- **FR-014**: Abas e botões de cabeçalho que o app já personaliza MUST receber a microinteração; componentes padrão de navegação não personalizados estão fora do escopo e MUST NOT ser substituídos para este fim.

### Key Entities *(include if feature involves data)*

- **Elemento de ação**: Qualquer elemento tocável que, ao ser acionado, executa uma ação (botão, cartão, item de menu, seletor, ícone). Possui estados: normal, pressionado, hover (web), carregando, desabilitado, selecionado.
- **Padrão de microinteração**: Conjunto único de regras de resposta (intensidade, duração, retorno) aplicado a cada categoria de elemento, com variante reduzida para acessibilidade.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos botões e elementos tocáveis que disparam uma ação, mapeados em inventário das telas do app, exibem resposta visual ao toque.
- **SC-002**: A resposta visual começa em até 100 ms após o toque, percebida como instantânea pelo usuário.
- **SC-003**: Nenhuma ação existente muda de resultado: 100% dos fluxos principais (login, cadastro, agendar, cancelar, diário, questionário, editar perfil) continuam concluindo com sucesso após a mudança.
- **SC-004**: Em testes de uso, pelo menos 90% dos participantes percebem que o toque foi reconhecido sem precisar de feedback adicional (ex.: sem tocar duas vezes).
- **SC-005**: Com "reduzir movimento" ativo, 0 botões exibem animação de escala/movimento.
- **SC-006**: Rolagem e navegação mantêm fluidez equivalente à anterior, sem travamentos perceptíveis nas telas com muitos elementos tocáveis.

## Assumptions

- "Todos os botões que resultem em uma ação" inclui botões tradicionais e também elementos tocáveis equivalentes (cartões, itens de menu, seletores, ícones de navegação); elementos puramente decorativos ou sem ação ficam fora do escopo.
- O estilo adotado é discreto e somente visual: sem som e sem vibração (feedback tátil/háptico), conforme confirmado na sessão de clarificação.
- A mesma linguagem visual é usada em todo o app, com variações apenas de intensidade conforme o tamanho do elemento.
- Telas do app em Android, iOS e web (a base atual já suporta as três) são cobertas; a aparência geral dos botões (cores, formas) não é alterada.
- Links de texto embutidos em frases (ex.: "Esqueci minha senha", "Cadastre-se") não são botões e ficam fora do escopo, para não alterar o layout do texto.
- Animações já existentes (transições entre telas, cascata de agendamentos) permanecem inalteradas e esta feature não interfere nelas.
- Os estados de carregamento e desabilitado já existentes nos botões são mantidos; a feature apenas suaviza as transições entre eles.
