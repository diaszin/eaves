# Feature Specification: Animação de sucesso no botão de login

**Feature Branch**: `011-login-success-animation`

**Created**: 2026-11-21

**Status**: Draft

**Input**: User description: "Adicione a animação check-mark ao fazer o login no app. O redirecionamento deve ser feito após a finalização da animação e a animação deve estar dentro do botão"

## Clarifications

### Session 2026-11-21

- Q: Enquanto a animação de check toca dentro do botão, o que acontece com a cor de fundo do botão? → A: O fundo do botão passa para verde, acompanhando a cor da animação.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver a confirmação animada dentro do botão "Entrar" (Priority: P1)

Ao informar e-mail e senha válidos e tocar em "Entrar", o botão passa pelo estado de carregamento já existente. Quando o login é aceito, o conteúdo do botão é substituído pela animação de check de sucesso, sem que o botão mude de posição ou tamanho. Somente depois que a animação termina o usuário é levado para a tela inicial.

**Why this priority**: É o objetivo único da funcionalidade: dar um feedback visual claro de que o login deu certo antes de trocar de tela.

**Independent Test**: Fazer login com credenciais válidas e verificar que a animação de check aparece dentro do botão, toca até o fim uma vez e só então a tela inicial é aberta.

**Acceptance Scenarios**:

1. **Given** credenciais válidas preenchidas, **When** o usuário toca em "Entrar" e o login é aceito, **Then** o texto, o ícone ou o indicador de carregamento do botão dá lugar à animação de check, exibida dentro dos limites do botão.
2. **Given** a animação de check está tocando, **When** ela chega ao último quadro, **Then** o usuário é redirecionado para a tela inicial.
3. **Given** a animação de check está tocando, **When** o usuário tenta tocar novamente no botão, **Then** nada acontece (não há novo envio nem redirecionamento duplicado).
4. **Given** o login foi aceito, **When** a animação ainda não terminou, **Then** o usuário permanece na tela de login.

---

### User Story 2 - Mesmo comportamento no login com Microsoft (Priority: P2)

Ao concluir com sucesso o login pelo botão "Continuar com Microsoft", a mesma animação de check é exibida dentro desse botão e o redirecionamento ocorre apenas após o término da animação.

**Why this priority**: Mantém a experiência consistente entre as duas formas de entrar; o login por e-mail e senha já entrega o valor principal.

**Independent Test**: Concluir o login com Microsoft para uma conta já cadastrada e verificar a animação no botão seguida do redirecionamento.

**Acceptance Scenarios**:

1. **Given** o login com Microsoft foi aceito para uma conta existente, **When** a resposta de sucesso chega, **Then** a animação de check aparece dentro do botão da Microsoft e, ao terminar, o usuário vai para a tela inicial.
2. **Given** a conta Microsoft ainda não tem cadastro completo, **When** o usuário é encaminhado ao cadastro, **Then** a animação de sucesso não é exibida.

---

### Edge Cases

- Login recusado (credenciais inválidas ou erro de rede): a animação não aparece, o botão volta ao estado normal e a mensagem de erro existente continua sendo exibida.
- A animação não consegue ser exibida: o redirecionamento ainda deve ocorrer, sem ficar preso na tela de login.
- Usuário sai da tela de login (fecha o app ou volta) durante a animação: não deve haver redirecionamento duplicado nem erro.
- Botão com largura variada (telas pequenas e grandes): a animação deve caber no botão sem cortes ou deformação.
- A sessão deve ser considerada iniciada assim que o login é aceito, mesmo que o redirecionamento aguarde a animação.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Ao ter o login aceito, o botão de ação MUST exibir a animação de check de sucesso do projeto no lugar do seu conteúdo atual (texto, ícone ou indicador de carregamento).
- **FR-002**: A animação MUST ser exibida inteiramente dentro dos limites do botão, sem alterar a altura, a largura ou a posição do botão e sem deslocar os demais elementos da tela.
- **FR-002a**: Enquanto a animação de sucesso é exibida, o fundo do botão MUST passar para a cor verde da animação (aplicável também ao botão da Microsoft no login com Microsoft), de modo que a animação seja legível sobre o botão; ao fim do fluxo o usuário já foi redirecionado, portanto não há retorno de cor a tratar.
- **FR-003**: A animação MUST tocar uma única vez, do início ao fim, sem exigir interação do usuário.
- **FR-004**: O redirecionamento para a tela inicial MUST ocorrer somente após a animação terminar.
- **FR-005**: Enquanto a animação toca, o botão MUST permanecer desabilitado, impedindo novos envios e redirecionamentos duplicados.
- **FR-006**: Se o login for recusado ou falhar, a animação MUST NOT ser exibida e o comportamento atual de erro MUST ser preservado.
- **FR-007**: A mesma animação e a mesma regra de redirecionamento MUST valer para o login com Microsoft quando ele resultar em acesso aceito.
- **FR-008**: Se a animação não puder ser exibida ou não sinalizar o término, o usuário MUST ainda ser redirecionado em um tempo limitado.
- **FR-009**: O destino do redirecionamento e o registro da sessão MUST permanecer iguais aos atuais.

### Key Entities

- **Animação de check de sucesso**: recurso visual existente no projeto (animação "check-mark"), usado como indicador de login concluído.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos logins aceitos, a animação de check é exibida dentro do botão antes de qualquer troca de tela.
- **SC-002**: Em 100% dos logins aceitos, o redirecionamento ocorre depois do término da animação e no máximo 1 segundo após ele.
- **SC-003**: O botão mantém exatamente as mesmas dimensões antes, durante e depois da animação, e seu fundo fica verde durante a animação em 100% dos logins aceitos.
- **SC-004**: Em 0% dos logins recusados a animação de sucesso é exibida.
- **SC-005**: Nenhum login gera mais de um redirecionamento, mesmo com toques repetidos no botão.

## Assumptions

- A tela de login é a única tela afetada; cadastro e recuperação de senha ficam fora do escopo.
- A animação usa o arquivo de animação "check-mark" já adicionado ao projeto; suas cores (verde e branco) são adequadas ao botão de login.
- O destino do redirecionamento (raiz do app) e o registro da sessão são mantidos; só o momento do redirecionamento muda.
- A animação dura cerca de 2 a 3 segundos, considerado aceitável para a espera antes do redirecionamento.
- Nenhum tratamento especial para movimento reduzido é exigido nesta versão.
