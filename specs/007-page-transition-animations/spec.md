# Feature Specification: Animações de Transição entre Telas

**Feature Branch**: `007-page-transition-animations`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Implemente animação para navegação entre páginas no app. Para a tela de escolha de profissionais e a tela de agendamento aquele profissional use o padrão de transição Shared element / Hero e para as outras navegações use o Fade through"

## Contexto

No aplicativo móvel do paciente, a navegação entre telas hoje acontece sem uma linguagem de movimento consistente. Esta feature define duas transições visuais: uma de **elemento compartilhado (Hero)** para o fluxo "escolher profissional → agendar com aquele profissional", e uma de **esmaecimento em sequência (Fade through)** para todas as demais navegações.

## Clarifications

### Session 2026-11-20

- Q: Qual parte do card do profissional deve "viajar" da lista para a tela de agendamento na transição Hero? → A: O card inteiro, que se expande até virar o cabeçalho da tela de agendamento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Transição Hero ao escolher um profissional (Priority: P1)

O paciente está na tela de escolha de profissionais e toca em um profissional. Na transição para a tela de agendamento com aquele profissional, o card inteiro do profissional "viaja" visualmente da posição na lista e se expande até virar o cabeçalho da tela de agendamento, dando continuidade ao contexto. Ao voltar, o cabeçalho se recolhe de volta ao card de origem.

**Why this priority**: É o pedido específico e de maior impacto visual do fluxo principal de agendamento.

**Independent Test**: Abrir a lista de profissionais, tocar em um deles e observar que o elemento do profissional se move continuamente para a tela de agendamento; voltar e observar o retorno ao mesmo card.

**Acceptance Scenarios**:

1. **Given** a lista de profissionais visível, **When** o paciente toca em um profissional, **Then** o card desse profissional (e somente ele) anima da lista e se expande até o cabeçalho da tela de agendamento, enquanto o restante do conteúdo aparece de forma suave.
2. **Given** a tela de agendamento de um profissional, **When** o paciente volta, **Then** o elemento compartilhado anima de volta ao card do mesmo profissional na lista.
3. **Given** uma lista com vários profissionais, **When** o paciente escolhe o segundo ou terceiro, **Then** a animação parte do card escolhido, não de outro.

---

### User Story 2 - Transição Fade through nas demais navegações (Priority: P2)

Em qualquer outra navegação entre telas (ex.: início → perfil, perfil → alterar dados, diário → novo registro, login → cadastro, abertura de termos legais), a tela atual esmaece e some, e a nova tela esmaece e surge em seguida, sem deslocamento de elemento compartilhado.

**Why this priority**: Dá consistência ao app inteiro, mas é menos crítica que o fluxo de agendamento.

**Independent Test**: Navegar entre telas que não fazem parte do fluxo de profissionais e verificar que a saída e a entrada ocorrem por esmaecimento sequencial, tanto ao avançar quanto ao voltar.

**Acceptance Scenarios**:

1. **Given** qualquer tela fora do fluxo profissional→agendamento, **When** o paciente navega para outra tela, **Then** o conteúdo atual esmaece e o novo conteúdo surge por esmaecimento em sequência.
2. **Given** uma tela aberta por Fade through, **When** o paciente volta, **Then** a mesma transição Fade through é aplicada.
3. **Given** a navegação entre as abas principais do início, **When** o paciente troca de aba, **Then** a troca também ocorre por Fade through.

---

### Edge Cases

- Paciente toca em um profissional e volta rapidamente, ou toca repetidamente: a animação não deve duplicar telas nem deixar elementos "presos" no meio do movimento.
- Dispositivo com a opção de reduzir movimento ativada: transições devem ser reduzidas a uma troca simples/instantânea, sem movimento de elemento.
- Gesto de voltar do sistema (botão/gesto Android): usa a mesma transição inversa da navegação correspondente.
- Imagem do profissional ainda carregando ou ausente: a transição ocorre sem falhas, usando o elemento disponível (ex.: iniciais/placeholder).
- Lista de profissionais rolada: o elemento compartilhado parte da posição visível atual do card.
- Aparelhos de baixo desempenho: a transição não deve travar a interação nem causar quedas visíveis de fluidez.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao navegar da tela de escolha de profissionais para a tela de agendamento de um profissional, o sistema MUST aplicar transição de elemento compartilhado (Hero) em que o card inteiro do profissional escolhido se expande até se tornar o cabeçalho da tela de agendamento.
- **FR-002**: Ao voltar da tela de agendamento para a lista de profissionais, o sistema MUST aplicar a transição Hero inversa, com o cabeçalho se recolhendo de volta ao card do profissional correspondente.
- **FR-003**: O elemento compartilhado MUST corresponder exclusivamente ao profissional selecionado, mesmo havendo vários profissionais na lista.
- **FR-004**: Todas as demais navegações entre telas do app (avançar, voltar, troca de abas, abertura de telas de autenticação, perfil, diário, questionários e termos) MUST usar a transição Fade through.
- **FR-005**: A transição Fade through MUST consistir em esmaecer a tela de saída e, em seguida, esmaecer a tela de entrada, sem elemento compartilhado.
- **FR-006**: Nenhuma navegação do app MUST ficar sem transição definida: cada uma usa Hero (somente o fluxo profissional→agendamento) ou Fade through.
- **FR-007**: As transições MUST ser interrompíveis de forma segura: toques repetidos ou voltar durante a animação não podem gerar telas duplicadas, travamentos ou estado visual inconsistente.
- **FR-008**: Quando o dispositivo tiver a preferência de reduzir movimento ativada, o sistema MUST substituir as transições por uma versão sem movimento de deslocamento (troca simples ou esmaecimento curto).
- **FR-009**: As animações MUST NOT alterar o comportamento funcional das telas (dados exibidos, resultado de agendar, ordem de navegação).
- **FR-010**: Se o elemento compartilhado não puder ser exibido (ex.: imagem indisponível), o sistema MUST concluir a navegação normalmente com Fade through como alternativa.

### Key Entities

Não envolve dados novos; a feature é puramente visual e atua sobre as telas e o card do profissional já existente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das navegações entre telas do app apresentam transição animada (Hero ou Fade through), sem trocas bruscas.
- **SC-002**: Em 100% das escolhas de profissional, o elemento animado parte do card escolhido e retorna a ele ao voltar.
- **SC-003**: Cada transição dura entre 200 ms e 500 ms, perceptível mas sem atrasar a tarefa.
- **SC-004**: Os pacientes conseguem escolher um profissional e iniciar o agendamento na mesma quantidade de toques e sem aumento perceptível de tempo em relação ao comportamento anterior.
- **SC-005**: Em testes de uso rápido (toques repetidos, voltar durante a animação), 0 ocorrências de tela duplicada, travamento ou elemento preso.
- **SC-006**: Com "reduzir movimento" ativado, 0 transições com deslocamento de elemento são exibidas.

## Assumptions

- Escopo restrito ao aplicativo móvel do paciente; o painel web não é afetado.
- "Tela de escolha de profissionais" é a lista de profissionais da jornada de agendamento, e "tela de agendamento" é a tela de seleção de data/horário daquele profissional.
- O elemento compartilhado é o card inteiro do profissional; a tela de agendamento deve ter um cabeçalho que represente o mesmo profissional com os mesmos dados do card.
- Fluxos modais ou de sobreposição (ex.: confirmações) seguem o Fade through como as demais navegações.
- Duração e curva de movimento seguem padrões usuais de Material Design para os dois padrões de transição.
- Android é a plataforma principal de verificação; comportamento equivalente é desejado em iOS e web sempre que suportado.
