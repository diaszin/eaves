# Research: Pesquisas Agrupadas por Paciente

## Estado atual (verificado no código)

- `GET /survey/phq/daily/responses` retorna todas as respostas PHQ-9 já agregadas por paciente + dia (`SurveyService.toPHQ9Responses`), ordenadas por data decrescente; `GET .../responses/:id` retorna uma. Ambos exigem `SurveyPolicy.viewResponses`.
- Cada resposta tem `id`, `createdAt`, `totalScore`, `severity`, `answers[]` e `patient { id, email, profile.fullname }`. Não há campo de categoria, embora a entidade `Survey` tenha a coluna `type` (hoje só `PHQ`).
- `SurveysList` (painel esquerdo) filtra a lista por nome e navega para `/surveys/:id` (id da resposta). `SurveysPage` mostra o detalhe da resposta.

## Decisões

### 1. Onde agrupar por paciente

- **Decision**: agrupar e ordenar no cliente, a partir da lista que a API já retorna.
- **Rationale**: nenhuma regra de negócio nova; a lista já é carregada hoje por inteiro; evita endpoint novo, DTOs e testes extras (YAGNI, Princípio V). Atende SC-003 (até 500 respostas por paciente) com folga, pois é filtragem em memória.
- **Alternatives considered**: endpoint `GET /survey/phq/patients` com resumo agregado e `GET /survey/phq/patients/:id/responses?from&to&category` com filtros no servidor. Mais escalável, porém mais código, mais contratos e sem ganho perceptível na escala atual. Registrar como evolução se o volume crescer.

### 2. Filtro de categoria

- **Decision**: adicionar o campo aditivo `category` (valor da coluna `type`, hoje `PHQ`) a cada resposta e oferecer no filtro as categorias presentes nas respostas do paciente, com rótulo amigável ("PHQ-9").
- **Rationale**: sem o campo o filtro seria cosmético e quebraria ao surgir nova categoria; a mudança é compatível e sem migração.
- **Alternatives considered**: inferir `PHQ-9` fixo no cliente (acopla o cliente a um valor único); novo endpoint de categorias (excessivo).

### 3. Filtro de data

- **Decision**: dois campos de data (inicial e final, opcionais, inclusivos) comparados pela data local de `createdAt` (formato `YYYY-MM-DD` no fuso do navegador); inicial > final bloqueia aplicação e mostra aviso.
- **Rationale**: atende à edge case de fuso (spec) e FR-007/FR-011; `<input type="date">` nativo, sem dependência.
- **Alternatives considered**: biblioteca de date range picker (nova dependência sem necessidade); presets (7/30/90 dias), fora do pedido.

### 4. Navegação e rotas

- **Decision**: nova rota `surveys/patient/:patientId` (paciente selecionado) com resposta aberta via query `?response=<id>`; a rota existente `surveys/:id` permanece: a página resolve o paciente dono da resposta e exibe o perfil com aquela resposta aberta.
- **Rationale**: FR-014 (links antigos continuam válidos); item ativo da lista e link compartilhável derivam da URL, como no padrão atual.
- **Alternatives considered**: estado local sem URL (perde deep link/refresh); substituir `:id` por paciente (quebra links existentes).

### 5. Reinício de filtros ao trocar de paciente

- **Decision**: estado dos filtros vive no componente do perfil e é reiniciado por `key={patientId}`.
- **Rationale**: spec exige reset (cenário 6 da US3) e não persistência entre sessões; sem armazenamento.

### 6. Fuso e consistência de datas

- **Decision**: o servidor já agrupa por dia em `America/Bahia`; o cliente usa a data local do navegador para filtrar e exibir.
- **Rationale**: mantém o que o usuário vê = o que é filtrado; divergências só ocorreriam em fusos diferentes do Brasil, aceitável para o escopo.

## Questões abertas

Nenhuma. Todas as incertezas técnicas foram resolvidas acima.
