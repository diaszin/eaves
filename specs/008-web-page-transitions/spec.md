# Feature Specification: Transições entre Telas na Web

**Feature Branch**: `008-web-page-transitions`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Faça a implementação para funcionar também na web"

## Contexto

A feature [007-page-transition-animations](../007-page-transition-animations/spec.md) definiu duas transições no aplicativo do paciente: **Hero** (elemento compartilhado) entre a lista de profissionais e o agendamento daquele profissional, e **Fade through** (esmaecimento em sequência) nas demais navegações. Ela foi pensada e verificada para o aplicativo móvel (Android como plataforma principal). O aplicativo também roda como site no navegador, e lá as transições não estão garantidas. Esta feature faz as mesmas transições funcionarem na versão web do aplicativo, com o mesmo resultado percebido pelo usuário.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fade through em todas as navegações na web (Priority: P1)

Quem usa o aplicativo no navegador navega entre telas (abas do início, perfil, diário, questionário, login e cadastro, termos) e vê o conteúdo atual esmaecer e o novo conteúdo surgir em seguida, em vez de uma troca seca.

**Why this priority**: Cobre todas as navegações da versão web, é a base de consistência e o mínimo para dizer que as transições funcionam na web.

**Independent Test**: Abrir o aplicativo no navegador, navegar entre telas fora do fluxo de profissionais, avançando e voltando, e verificar o esmaecimento em cada uma.

**Acceptance Scenarios**:

1. **Given** o aplicativo aberto no navegador, **When** o usuário navega para outra tela, **Then** a tela atual esmaece e a nova surge por esmaecimento em sequência.
2. **Given** uma tela aberta por Fade through, **When** o usuário volta (botão do app ou botão "voltar" do navegador), **Then** a mesma transição é aplicada.
3. **Given** as abas principais do início, **When** o usuário troca de aba, **Then** a troca ocorre por Fade through.
4. **Given** a primeira carga ou o recarregamento da página, **When** a tela inicial aparece, **Then** não há transição estranha nem piscada fora do esmaecimento normal.

---

### User Story 2 - Hero ao escolher um profissional na web (Priority: P2)

No navegador, o usuário toca/clica em um profissional na lista e o card dele se expande até virar o cabeçalho da tela de agendamento; ao voltar, o cabeçalho se recolhe de volta ao card de origem.

**Why this priority**: É o diferencial visual da feature 007, mas a navegação funciona sem ele desde que o Fade through esteja ativo.

**Independent Test**: No navegador, abrir a lista de profissionais, clicar no segundo ou terceiro profissional, observar a expansão do card escolhido e o retorno ao voltar.

**Acceptance Scenarios**:

1. **Given** a lista de profissionais no navegador, **When** o usuário clica em um profissional, **Then** o card desse profissional (e somente ele) se expande até o cabeçalho da tela de agendamento.
2. **Given** a tela de agendamento aberta, **When** o usuário volta, **Then** o cabeçalho se recolhe ao card do mesmo profissional.
3. **Given** uma página recarregada diretamente na tela de agendamento (sem passar pela lista), **When** a tela carrega, **Then** ela aparece normalmente, sem erro e sem animação de elemento compartilhado.

---

### Edge Cases

- Usuário abre direto o endereço da tela de agendamento ou recarrega a página nela: a tela carrega sem Hero e sem erros.
- Botões "voltar" e "avançar" do navegador: usam as mesmas transições da navegação equivalente dentro do app.
- Navegador com "reduzir movimento" ativado no sistema: as transições viram troca simples, sem deslocamento de elemento.
- Cliques repetidos no mesmo profissional ou voltar durante a animação: sem tela duplicada nem elemento preso.
- Janela redimensionada ou rolagem da lista: o Hero parte da posição atual do card.
- Navegador sem suporte ao recurso de animação do elemento compartilhado: a navegação conclui normalmente com Fade through.
- Dispositivos e navegadores mais lentos: a transição não trava a interação.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Na versão web, todas as navegações entre telas, exceto a de profissional → agendamento, MUST usar a transição Fade through, incluindo troca de abas, telas de autenticação, perfil, diário, questionário e termos.
- **FR-002**: Na versão web, a navegação da lista de profissionais para o agendamento de um profissional MUST usar a transição Hero, com o card inteiro do profissional escolhido se expandindo até o cabeçalho da tela de agendamento.
- **FR-003**: Ao voltar do agendamento para a lista, a versão web MUST aplicar a transição Hero inversa, com o cabeçalho se recolhendo ao card do mesmo profissional.
- **FR-004**: O elemento do Hero MUST corresponder exclusivamente ao profissional selecionado.
- **FR-005**: Os botões "voltar" e "avançar" do navegador MUST disparar as mesmas transições da navegação equivalente dentro do aplicativo.
- **FR-006**: Abrir ou recarregar uma tela diretamente pelo endereço MUST carregar a tela normalmente, sem erro e sem exigir o Hero.
- **FR-007**: Se o Hero não puder ser exibido no navegador, a navegação MUST concluir com Fade through como alternativa.
- **FR-008**: Com a preferência de reduzir movimento ativada no navegador/sistema, as transições MUST ser substituídas por troca simples, sem deslocamento de elemento.
- **FR-009**: Interações rápidas (cliques repetidos, voltar durante a animação) MUST NOT gerar telas duplicadas, travamentos ou estado visual inconsistente.
- **FR-010**: As transições na web MUST NOT alterar o comportamento funcional das telas nem o endereço exibido para cada tela.
- **FR-011**: O comportamento nas plataformas móveis definido na feature 007 MUST permanecer inalterado.

### Key Entities

Não envolve dados novos; atua sobre as telas e o card do profissional já existentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das navegações entre telas na versão web apresentam transição animada (Hero ou Fade through), sem trocas bruscas.
- **SC-002**: Em 100% das escolhas de profissional na web, o elemento animado parte do card escolhido e retorna a ele ao voltar.
- **SC-003**: Cada transição na web dura entre 200 ms e 500 ms.
- **SC-004**: As transições funcionam nas versões atuais dos principais navegadores de computador e celular (Chrome, Edge, Firefox e Safari).
- **SC-005**: Em testes de uso rápido (cliques repetidos, voltar/avançar do navegador durante a animação), 0 ocorrências de tela duplicada, travamento ou elemento preso.
- **SC-006**: Com "reduzir movimento" ativado, 0 transições com deslocamento de elemento são exibidas.
- **SC-007**: 100% dos cenários de aceitação da feature 007 que se aplicam à web passam na versão web, e nenhum cenário móvel regride.

## Assumptions

- Escopo restrito à versão web do aplicativo do paciente; o painel administrativo web é outro projeto e não é afetado.
- O resultado visual esperado na web é o mesmo definido na feature 007; "funcionar na web" significa equivalência percebida, não necessariamente a mesma técnica de implementação.
- A duração na web segue a faixa de 200–500 ms (o desvio de ~150 ms aceito no Android não se aplica à web).
- Navegadores suportados: versões atuais de Chrome, Edge, Firefox e Safari, em computador e celular.
- A feature 007 permanece como base; esta feature é complementar e não refaz o que já funciona nas plataformas móveis.
- A verificação final da feature 007 no dispositivo (T014) segue pendente e é independente desta feature.
