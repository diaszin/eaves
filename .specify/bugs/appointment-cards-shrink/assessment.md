# Bug Assessment: Cards encolhem durante a animação de entrada

- **Slug**: appointment-cards-shrink
- **Created**: 2026-11-20T21:33:12-03:00
- **Source**: Texto colado e URL `http://localhost:8081/`
- **Verdict**: likely valid, needs reproduction
- **Severity**: medium

## Report (verbatim or summarized)

> Existe um bug ao rodar animação, os cards vão escolhendo até ter um tamanho muito pequeno. Isso pode ser testado em http://localhost:8081/

**URL policy**

- URL: `http://localhost:8081/`
- Host: `localhost`
- Decision: `auto-refused: loopback/localhost`. A página não foi acessada; a avaliação se baseia no relato e no código local.

## Symptom

Durante a animação de entrada na página inicial web, os cartões de agendamento aparentemente encolhem progressivamente até ficarem muito pequenos. O esperado é que mantenham suas dimensões enquanto apenas opacidade e posição vertical são animadas.

## Reproduction

1. Abrir a aplicação web indicada pelo usuário em `http://localhost:8081/`.
2. Entrar na página inicial com cartões de agendamento suficientes para disparar a animação em cascata.
3. Observar se os cartões diminuem de tamanho durante a animação.

[NEEDS CLARIFICATION: quantidade de agendamentos, dimensões da janela, se a redução ocorre em todos os cartões ou apenas em alguns, e se o tamanho permanece reduzido após o fim da animação.]

## Suspected Code Paths

- `app/src/templates/get-recently-appointments.tsx:67` — configura `FadeInDown`, a animação de entrada aplicada aos cartões.
- `app/src/templates/get-recently-appointments.tsx:114` — constrói o conteúdo do cartão que é exibido durante a transição.
- `app/src/templates/get-recently-appointments.tsx:205` — introduz um `Animated.View` externo ao redor do cartão elegível; essa mudança de contêiner pode afetar o layout da linha no web.
- `app/src/templates/get-recently-appointments.tsx:292` — a lista usa `FlatList`, que por sua vez está dentro do `ScrollView` da página inicial.
- `app/src/app/(app)/(authenticated)/(home)/index.tsx:13` — contêiner de rolagem da home, relevante para o cálculo de layout/viewport.
- `app/src/shared/components/pressable-scale.tsx:103` — os botões têm transformação de escala associada a pressionamento; não há evidência no código de que essa escala seja aplicada automaticamente ao cartão inteiro.

## Root Cause Hypothesis

**Confidence: low.** O código usa um `Animated.View` externo para cartões elegíveis, enquanto os demais são renderizados como `View`; essa diferença pode alterar as restrições de largura/comportamento flex das linhas no web. A animação `FadeInDown` em si anima opacidade e `translateY`, sem uma escala que explique diretamente cartões diminuindo. Como o endereço fornecido é loopback e não foi acessado, a causa exata e a reprodução ainda não foram confirmadas.

## Proposed Remediation

**Preferred**: Reproduzir com vários agendamentos e comparar as dimensões do contêiner e do cartão antes, durante e depois da entrada. Se a redução vier do contêiner introduzido pela animação, preservar o layout da linha — aplicando restrições de largura/flex adequadas ou animando a raiz existente do cartão sem adicionar uma caixa de layout que colapse. Evitar alterar a transformação da animação até confirmar qual elemento está mudando de tamanho.

**Alternatives**:
- Se as dimensões do cartão permanecerem estáveis e apenas o conteúdo parecer menor, verificar se há transformação herdada/concorrente no web e delimitar a transformação ao elemento animado. Isso pode exigir separar animação de entrada e microinteração dos botões.
- Se a redução for causada por medição/virtualização do `FlatList` aninhado, ajustar a estratégia de medição ou o contêiner de rolagem; isso tem maior impacto no layout e deve ser preferido apenas com evidência.

**Files likely to change**:
- `app/src/templates/get-recently-appointments.tsx`
- `app/src/app/(app)/(authenticated)/(home)/index.tsx` somente se a verificação confirmar interferência do contêiner de rolagem.

**Tests to add or update**:
- Verificação web com múltiplos agendamentos sintéticos: medir largura e altura dos cartões antes, durante e após a animação e garantir que não diminuam progressivamente.
- Repetir a verificação em movimento reduzido e em runtime nativo, confirmando que a lista continua rolável e que os botões dos cartões mantêm seu comportamento.

## Risks & Considerations

- Forçar largura ou `flexShrink` sem reproduzir pode causar regressões de responsividade em telas menores.
- Alterar a estrutura da linha pode afetar medição da viewport, rolagem e ações dos cartões; validar web e nativo.
- Não há indicação de impacto em API, persistência, dados sensíveis ou segurança.

## Open Questions

- [NEEDS CLARIFICATION: a redução ocorre somente no web (`localhost:8081`) ou também em Android/iOS?]
- [NEEDS CLARIFICATION: os cartões ficam pequenos depois que a animação termina ou retornam ao tamanho esperado?]
- [NEEDS CLARIFICATION: o problema ocorre sem interagir com os botões ou somente após pressionar/soltar um deles?]
