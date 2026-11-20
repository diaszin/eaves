# Feature Specification: Exportação de Escalas e Pesquisas (Excel e PDF)

**Feature Branch**: `003-schedule-survey-export`

**Created**: 2026-11-20

**Status**: Draft

**Input**: User description: "Faça a implementação de exportação em excel e PDF para os dados da página de escala e pesquisa no platform. Para a escala deve exportado os horários e dias daquele determinado estagiário, na pesquisa deve ser exportado a pontuação daquele paciente, o questionário e o total das pontuações"

## Clarifications

### Session 2026-11-20

- Q: Quem pode exportar as pesquisas (PHQ-9) de pacientes? → A: Todos os papéis que já veem a página de Pesquisas; a exportação não restringe além do acesso atual.
- Q: Ao exportar a escala de um estagiário, o arquivo traz só a escala aberta ou todas as ativas? → A: O usuário escolhe no momento da exportação (escala atual ou todas as escalas ativas do estagiário).
- Q: A exportação em lote das pesquisas entra nesta entrega? → A: Não; somente exportação individual.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Exportar a escala de um estagiário (Priority: P1)

Um coordenador ou professor, na página de Escalas do painel administrativo, seleciona a escala de um estagiário e escolhe exportá-la em Excel ou PDF. O arquivo gerado contém os dias e horários de atendimento daquele estagiário, para impressão, compartilhamento ou arquivamento.

**Why this priority**: É o primeiro dos dois pedidos e atende à necessidade de distribuir a escala fora do sistema (murais, e-mail, documentação do estágio).

**Independent Test**: Abrir uma escala com turnos, acionar "Exportar Excel" e "Exportar PDF" e conferir que cada arquivo lista o estagiário e todos os seus dias e horários, sem depender da exportação de pesquisas.

**Acceptance Scenarios**:

1. **Given** uma escala de estagiário com turnos cadastrados, **When** o usuário escolhe exportar em Excel, **Then** é baixado um arquivo .xlsx com o nome do estagiário, o título e o período da escala, e uma linha por turno com dia (da semana ou data específica), horário de início, horário de término, local e observações.
2. **Given** a mesma escala, **When** o usuário escolhe exportar em PDF, **Then** é baixado um PDF legível com as mesmas informações, formatado para impressão.
3. **Given** uma escala com turnos em dias da semana recorrentes e em datas específicas, **When** exportada, **Then** ambos os tipos aparecem identificados corretamente e ordenados (dias da semana de domingo a sábado, datas específicas em ordem cronológica).
4. **Given** uma escala sem nenhum turno, **When** o usuário tenta exportar, **Then** o sistema informa que não há horários para exportar e não gera arquivo vazio.

---

### User Story 2 - Exportar a pesquisa (PHQ-9) de um paciente (Priority: P1)

Um usuário autorizado, na página de Pesquisas, abre a resposta de um paciente e a exporta em Excel ou PDF. O arquivo contém a pontuação de cada pergunta do questionário, o texto de cada pergunta e o total das pontuações.

**Why this priority**: É o segundo pedido e permite incluir o resultado do paciente em prontuários e relatórios clínicos.

**Independent Test**: Abrir uma resposta de pesquisa, exportar em Excel e PDF e conferir que as 9 perguntas, suas pontuações e o total (e sua classificação) coincidem com o que é exibido na tela.

**Acceptance Scenarios**:

1. **Given** uma resposta de pesquisa de um paciente, **When** o usuário exporta em Excel, **Then** o arquivo contém identificação do paciente, data da resposta, cada pergunta com sua pontuação (0 a 3) e o rótulo da resposta, o total das pontuações e a classificação de gravidade.
2. **Given** a mesma resposta, **When** exportada em PDF, **Then** o PDF apresenta as mesmas informações de forma legível e imprimível.
3. **Given** uma resposta em que alguma pergunta não possui pontuação registrada, **When** exportada, **Then** a pergunta aparece com indicação de "sem resposta" e não é somada de forma incorreta; o total exportado é igual ao total exibido na tela.

---

### Edge Cases

- Nomes de estagiário/paciente com acentos ou caracteres especiais devem aparecer corretamente nos arquivos e no nome do arquivo gerado.
- Paciente sem nome de perfil: usar o e-mail como identificação.
- Escala sem data de término: o período deve indicar "sem data de término".
- Escala inativa: pode ser exportada, indicando seu status.
- Falha ao gerar o arquivo: o usuário vê uma mensagem de erro clara e pode tentar novamente.
- Usuário sem permissão para visualizar o dado não deve conseguir exportá-lo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST oferecer, na página de Escalas, ações de exportar em Excel e em PDF para a escala de um estagiário específico.
- **FR-002**: A exportação da escala MUST incluir nome do estagiário, título da escala, período de vigência, status (ativa/inativa) e, para cada turno, o dia (dia da semana ou data específica), horário de início, horário de término, local e observações.
- **FR-002a**: Ao exportar a escala, o sistema MUST permitir ao usuário escolher entre exportar apenas a escala selecionada ou todas as escalas ativas do mesmo estagiário; no segundo caso, o arquivo MUST identificar a qual escala (título) pertence cada turno.
- **FR-003**: Os turnos exportados MUST ser ordenados de forma consistente (dias da semana de domingo a sábado, depois datas específicas cronologicamente, e por horário de início).
- **FR-004**: O sistema MUST oferecer, na página de Pesquisas, ações de exportar em Excel e em PDF para a resposta de um paciente específico.
- **FR-005**: A exportação da pesquisa MUST incluir identificação do paciente, data da resposta, o texto de cada pergunta do questionário, a pontuação de cada pergunta com seu rótulo, o total das pontuações e a classificação de gravidade.
- **FR-006**: Os valores exportados (pontuações, total, horários) MUST ser idênticos aos exibidos na tela para o mesmo registro.
- **FR-007**: O sistema MUST bloquear a exportação e informar o usuário quando não houver dados a exportar.
- **FR-008**: O sistema MUST exibir feedback de progresso durante a geração e mensagem de erro em caso de falha.
- **FR-009**: Os arquivos MUST ter nome descritivo incluindo o tipo de conteúdo, o nome da pessoa e a data de geração.
- **FR-010**: Todo texto dos arquivos e da interface MUST estar em português do Brasil, com datas no formato brasileiro.
- **FR-011**: A exportação MUST respeitar as permissões existentes: qualquer papel que já possa visualizar escalas ou pesquisas no painel pode exportá-las (sem restrição adicional de papel para a exportação), e quem não pode visualizar o dado não pode exportá-lo.

### Key Entities

- **Escala (Schedule)**: Agenda de um estagiário, com título, período de vigência, status e um conjunto de turnos.
- **Turno (Shift)**: Dia da semana recorrente ou data específica, horário de início e término, local e observações.
- **Resposta de Pesquisa (Survey)**: Questionário PHQ-9 respondido por um paciente em uma data, com pontuação por pergunta, total e classificação de gravidade.
- **Arquivo de Exportação**: Documento Excel ou PDF gerado a partir de uma Escala ou Resposta de Pesquisa.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuário consegue baixar a escala de um estagiário em Excel ou PDF em até 3 cliques a partir da página de Escalas.
- **SC-002**: Um usuário consegue baixar a pesquisa de um paciente em Excel ou PDF em até 3 cliques a partir da página de Pesquisas.
- **SC-003**: 100% dos turnos de uma escala e 100% das perguntas de uma pesquisa aparecem no arquivo exportado, com valores iguais aos exibidos na tela.
- **SC-004**: O arquivo é disponibilizado em até 5 segundos para uma escala ou pesquisa individual.
- **SC-005**: Os arquivos abrem corretamente em editores de planilha e leitores de PDF comuns, sem caracteres corrompidos em textos com acentos.

## Assumptions

- Os usuários são os papéis que já acessam o painel administrativo (coordenador, professor e, quando aplicável, demais papéis com acesso às páginas); nenhum novo papel ou permissão é criado.
- "Excel" significa arquivo no formato .xlsx; "PDF" significa documento imprimível em formato A4.
- Apenas exportação individual (uma escala, uma resposta de paciente); a exportação em lote de pesquisas está fora do escopo.
- Os dados exportados são os já disponíveis nas telas atuais; não há novos campos nem alterações no armazenamento de dados.
- Pesquisas exportadas contêm dado sensível de saúde mental; o arquivo é de responsabilidade de quem o baixa, e nenhum envio automático (e-mail, nuvem) faz parte do escopo.
- Não há personalização de layout, logotipo ou filtros avançados de exportação nesta versão.
