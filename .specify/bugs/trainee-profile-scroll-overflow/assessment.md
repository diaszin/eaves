# Bug Assessment: Rolagem vertical e horizontal quebradas no perfil do estagiário (com gráfico)

- **Slug**: trainee-profile-scroll-overflow
- **Created**: 2026-11-19
- **Source**: pasted text
- **Verdict**: likely valid, needs reproduction
- **Severity**: medium

## Report (verbatim or summarized)

> Na página de visualização do perfil do estgiário que contém o dashboard está tendo um bug de rolagem vertical e a rolagem horizontal está além do conteudo do sistema

Interpretação: na página `/trainees/:id` da plataforma web (visão do coordenador, que exibe o gráfico "Agendamentos por mês"), a rolagem vertical se comporta de forma errada e existe rolagem horizontal que se estende além da área de conteúdo.

## Symptom

Ao abrir o perfil de um estagiário como coordenador (onde o gráfico de agendamentos é renderizado), a rolagem vertical apresenta comportamento incorreto e surge uma barra/área de rolagem horizontal que vai além do conteúdo da aplicação. Esperado: apenas a área de conteúdo rola verticalmente, sem rolagem horizontal.

## Reproduction

1. Logar na plataforma (`platform`) como `coordinator`.
2. Abrir `Estagiários` e selecionar um estagiário (`/trainees/:id`, renderiza `UsersPage`).
3. Observar a rolagem vertical e horizontal da página com o card "Agendamentos por mês".

[NEEDS CLARIFICATION: navegador/viewport, e se ocorre com estado de carregamento, vazio ou com dados no gráfico.]
[NEEDS CLARIFICATION: o "vertical" bugado é barra dupla (da `main` e do container interno), rolagem que não alcança o fim, ou o conteúdo cortado?]
[NEEDS CLARIFICATION: a rolagem horizontal aparece na página inteira (body) ou dentro da `main`?]

Não reproduzido em execução; análise apenas estática.

## Suspected Code Paths

- `platform/src/shared/components/layout/ThreePaneLayout.tsx:12` — raiz usa `h-screen w-screen overflow-hidden`; `w-screen` = 100vw, que inclui a largura da barra de rolagem vertical e pode gerar overflow horizontal. `main` (linha 15) é `flex-1 overflow-auto` sem `min-w-0`/`min-h-0`.
- `platform/src/features/users/screens/UsersPage.tsx:20-28` — `div.flex.h-full.flex-col` dentro de `main` (que já é `overflow-auto`) e depois `div.flex-1.overflow-auto`: dois contêineres de rolagem aninhados; `h-full` depende de altura percentual de um item flex stretch.
- `platform/src/features/users/screens/UsersPage.tsx:57-96` — `UserDetail` (`max-w-2xl`) com grid `grid-cols-2` e o gráfico no final; é o único conteúdo novo desta página.
- `platform/src/features/users/components/TraineeAppointmentsChart.tsx:141-174, 63-122` — gráfico em SVG `viewBox 480x240` com `h-auto w-full`; `<ul className="sr-only">` (linha 124) é `position:absolute` sem ancestral posicionado, então fica ancorado ao viewport/ICB e pode afetar o overflow do documento. Mudança introduzida no commit `f045524`, que coincide com o surgimento do bug.
- `platform/src/index.css` — sem `overflow`/`height` global em `html`/`body`/`#root`.

## Root Cause Hypothesis

Sem reprodução, a hipótese principal é de layout: o shell (`ThreePaneLayout`) combina `w-screen` (100vw) com contêineres de rolagem aninhados (`main` + `UsersPage`), e o conteúdo adicionado pelo gráfico (SVG + lista `sr-only` absoluta) aumenta a altura do conteúdo, fazendo as duas camadas de rolagem entrarem em conflito (vertical) e o 100vw/elemento absoluto gerar largura além do conteúdo (horizontal). Outras páginas usam o mesmo padrão `flex-1 overflow-auto`, então o gatilho provável é o novo gráfico (ou o `sr-only`). Confiança: **baixa-média** — precisa de inspeção no navegador (DevTools: qual elemento tem `scrollWidth > clientWidth`).

## Proposed Remediation

**Preferred**: (1) em `ThreePaneLayout`, trocar `w-screen` por `w-full` (e manter `h-screen`/`h-dvh`), e adicionar `min-w-0` na `main`; (2) em `UsersPage`, eliminar a rolagem aninhada: usar `h-full` + `min-h-0` no wrapper e manter só um contêiner de rolagem (o interno, com `overflow-y-auto overflow-x-hidden`), ou deixar a `main` rolar sozinha; (3) em `TraineeAppointmentsChart`, dar `relative` à `<section>` (para conter o `sr-only`) e `min-w-0`/`overflow-hidden` ao card, garantindo que o SVG se limite à largura do container (`max-w-full`).

**Alternatives**:
- Aplicar `overflow-x-hidden` em `main`: corrige o sintoma, mas mascara a causa e pode cortar conteúdo.
- Remover o `<ul className="sr-only">` e manter só `aria-label`/`<title>`: perde acessibilidade para leitores de tela.

**Files likely to change**:
- `platform/src/shared/components/layout/ThreePaneLayout.tsx`
- `platform/src/features/users/screens/UsersPage.tsx`
- `platform/src/features/users/components/TraineeAppointmentsChart.tsx`

**Tests to add or update**:
- Não há infraestrutura de testes de layout no `platform`; sugerir verificação manual (viewports 1280/1024/768, estados loading/vazio/com dados) e, se houver Playwright/Cypress, um teste de `document.documentElement.scrollWidth <= clientWidth` e de um único contêiner rolável em `/trainees/:id`.

## Risks & Considerations

- `ThreePaneLayout` é compartilhado por todas as páginas: mudar `w-screen`/`min-w-0` afeta todo o shell; validar as demais telas.
- Mudar o contêiner de rolagem de `UsersPage` pode alterar a posição do cabeçalho fixo "Usuários".
- Sem reprodução, risco de corrigir a causa errada.

## Open Questions

- [NEEDS CLARIFICATION: navegador, resolução e zoom usados quando o bug ocorre.]
- [NEEDS CLARIFICATION: o bug acontece também em outros perfis sem gráfico (admin/outras roles)?]
- [NEEDS CLARIFICATION: print/gravação mostrando as barras de rolagem.]
