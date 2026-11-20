# Research: Transições entre Telas na Web

Verificado no código instalado em `app/node_modules` (2026-11-20).

## 1. Por que a feature 007 não anima na web

- **Pilha**: no `react-native-screens`, `ScreenStack.web.tsx` é só um `View` e `Screen.web.tsx` só alterna `display` entre `flex` e `none`. O `NativeStackView` do Expo Router na web (`views/NativeStackView.js`) faz o mesmo: cada tela é `absoluteFill` com `display: flex | none`. Logo, `animation: "fade"` não tem efeito na web.
- **Hero**: `AnimatedComponent._configureSharedTransition` só configura com a flag estática ligada, e o gerenciador de animações de layout para web (`layoutReanimation/web`) cobre entrada, saída e transição de layout, não elemento compartilhado entre telas. Conclusão: `sharedTransitionTag` não produz Hero na web.
- **Abas**: o navegador de abas é em JavaScript (`bottom-tabs/views/BottomTabView.js`) e já usa `Animated` com a opção `animation`, então `animation: "fade"` (feature 007) já anima na web.

## 2. Fade through na web

- **Decision**: envoltório por tela via `screenLayout` das pilhas, com `useIsFocused`: ao ganhar foco, a opacidade vai de 0 a 1 em cerca de 250 ms, com 60 ms de atraso (a tela anterior some de imediato, porque a pilha a oculta com `display: none`). Total dentro de 200–500 ms.
- **Rationale**: `screenLayout` existe nas pilhas do Expo Router 57 (`StackClient.d.ts`), cobre qualquer forma de navegação (toque, voltar do app, voltar/avançar do navegador) e não depende de API do navegador.
- **Alternatives considered**: (a) animar a saída: impossível, pois a tela já está oculta quando o foco muda; (b) trocar a pilha por uma pilha em JavaScript (`@react-navigation/stack`): dependência nova e muda o comportamento em todas as plataformas; (c) animação CSS global por seletor: as telas não têm atributo de foco para o seletor.

## 3. Hero na web

- **Decision**: API *View Transitions* (`document.startViewTransition`) com `view-transition-name: professional-card-{id}` no card do profissional (lista e cabeçalho do agendamento). O navegador faz a expansão e o recolhimento do card sozinho, e o restante da tela esmaece.
- **Rationale**: mecanismo nativo, sem dependência, com suporte nas versões atuais de Chrome, Edge, Safari e Firefox (SC-004; confirmar no quickstart). Só um card por vez pode ter o nome ativo, então o nome é aplicado apenas ao card em navegação (a unicidade exigida pela API), o que também satisfaz FR-004.
- **Como envolver a atualização**: `startViewTransition(callback)` precisa que o callback devolva uma promessa que resolve quando a tela nova está pintada.
  - Toque no card e botão voltar do app: o helper chama o `push`/`back` dentro do callback e espera o foco mudar.
  - Voltar/avançar do navegador: um ouvinte de `popstate` registrado no carregamento do módulo, antes do roteador, inicia a transição e resolve quando o foco da tela mudar.
- **Alternativa de segurança (FR-007)**: sem `startViewTransition`, ou se a promessa não resolver em 400 ms, a navegação segue sem Hero e o Fade through da seção 2 cobre.
- **Alternatives considered**: (a) Reanimated: sem suporte na web (seção 1); (b) animar com `getBoundingClientRect` e overlay manual: muito código e frágil com rolagem (YAGNI); (c) Navigation API do navegador: sem suporte no Safari.
- **Risco**: capturar `popstate` antes do roteador depende da ordem de registro dos ouvintes. Se falhar, voltar/avançar do navegador cai no Fade through; deve ser verificado no quickstart (cenário 4).

## 4. Interação entre as duas camadas

Quando uma view transition está ativa, o envoltório de Fade through não deve animar (evita fade duplo): o helper expõe um estado "transição em andamento" lido pelo envoltório.

## 5. Reduzir movimento e acessibilidade

- **Decision**: se `matchMedia("(prefers-reduced-motion: reduce)")` for verdadeiro, o helper não inicia view transition e o envoltório mostra a tela sem animação.
- **Rationale**: atende FR-008 sem biblioteca.

## 6. Interrupção segura

- **Decision**: o helper ignora nova transição enquanto outra estiver ativa e chama `skipTransition()` se a tela de destino mudar antes do fim; o bloqueio de toque duplo da feature 007 (`isNavigating`) continua valendo.
- **Rationale**: FR-009/SC-005.

## 7. Recarregar direto na tela de agendamento

O Hero só existe quando há navegação de origem; ao carregar a página direto, não há transição, apenas o Fade through de entrada. O cabeçalho já recebe `id` e `fullname` pelos parâmetros da rota, então a tela carrega normalmente (FR-006).
