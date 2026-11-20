# Research: Animações de Transição entre Telas

## 1. Como implementar o Hero (elemento compartilhado)

- **Decision**: `sharedTransitionTag` do `react-native-reanimated` 4.5.1 no card do profissional, com tag `professional-card-{id}`, aplicado em um `Animated.View` dentro de `EmployeesCard`. O mesmo componente já é renderizado nas duas telas (lista e agendamento), então a tag liga as duas.
- **Rationale**: Reanimated e Worklets já estão instalados; nenhuma dependência nova. O recurso só entra com a flag estática `ENABLE_SHARED_ELEMENT_TRANSITIONS` (hoje `false` em `staticFeatureFlags.ts`), habilitada em `package.json` em `reanimated.staticFeatureFlags`. Exige rebuild nativo (a pasta `android/` existe), logo não funciona no Expo Go.
- **Alternatives considered**: (a) `Link.AppleZoom` do Expo Router: só iOS 18+, não cobre Android, a plataforma principal. (b) Animação manual com `measure` + overlay: muito código e frágil com rolagem (YAGNI). (c) Biblioteca de terceiros de shared element: dependência nova sem necessidade.
- **Risk**: recurso marcado como experimental no Reanimated 4.x. Mitigação: a navegação sempre usa fade como base, então se o elemento compartilhado não renderizar o usuário ainda vê uma transição suave (FR-010).

## 2. Como implementar o Fade through

- **Decision**: `animation: "fade"` em `screenOptions` das pilhas (raiz, autenticada, auth) e `animation: "fade"` nas abas (`Tabs`). A opção `animation` da pilha nativa aceita `fade`; a das abas aceita `none | fade | shift`. Duração em iOS via `animationDuration` (300 ms); no Android vale a duração padrão do sistema, dentro de 200–500 ms.
- **Rationale**: é a transição de esmaecimento nativa, sem JavaScript por quadro, e cobre todas as navegações com uma configuração central.
- **Alternatives considered**: transição customizada por tela com Reanimated (saída e depois entrada com escala): mais código por tela e mais risco de travar. O Fade through do Material inclui leve escala; a pilha nativa não permite isso, então o `fade` é a aproximação aceita (registrada como suposição).

## 3. Reduzir movimento

- **Decision**: hook `useScreenTransition()` em `shared/navigation/transitions.ts` usa `useReducedMotion()` do Reanimated; se ativo, devolve `animation: "none"` para pilhas e abas, e o card não recebe `sharedTransitionTag`.
- **Rationale**: atende FR-008/SC-006 em um único ponto, usando a API que já vem com o Reanimated.
- **Alternatives considered**: `AccessibilityInfo.isReduceMotionEnabled` direto: exige estado e listener manuais; o hook do Reanimated já faz isso.

## 4. Interrupção segura (toques repetidos / voltar durante a animação)

- **Decision**: no `onPress` do card, bloquear novo push enquanto uma navegação para a mesma tela está em andamento (flag local resetada ao voltar o foco). Não há garantia de que o Expo Router ignore pushes repetidos da mesma rota, por isso o bloqueio é explícito.
- **Rationale**: evita tela duplicada (FR-007/SC-005) sem depender de comportamento implícito.

## 5. Escopo das navegações

Mapa das telas e transições em [contracts/transitions.md](contracts/transitions.md). Telas que usam `Stack.Screen` com opções próprias (agendar, perfil, diário, PHQ) não definem `animation`, herdando o fade do layout; a de agendamento também herda o fade como base sob o Hero.

## 6. Verificação na documentação e no código instalado (T017, 2026-11-20)

- **Pilha**: o guia do Stack do Expo v57 lista `animation: "fade"` e `animationDuration`. `animationDuration` só vale no **iOS** (padrão 350 ms). Confere com o código instalado.
- **Android**: o fade da pilha vem de `rns_fade_in.xml` / `rns_fade_out.xml` em `react-native-screens`, com **150 ms fixos** (não configuráveis por `animationDuration`). Isso fica abaixo dos 200 ms de SC-003. **Decisão (usuário): aceitar 150 ms no Android** e ajustar SC-003 na spec; sem patch na biblioteca. T016.
- **Abas**: o guia de Tabs do Expo **não documenta** `animation`, mas os tipos instalados do bottom-tabs em `expo-router` aceitam `animation: 'none' | 'fade' | 'shift'`. Uso mantido, por ser suportado pelos tipos; validar em T014.
- **Hero**: `sharedTransitionTag` não aparece nas páginas do Expo lidas; o suporte depende do Reanimated (flag `ENABLE_SHARED_ELEMENT_TRANSITIONS`) e não foi confirmado em Expo Go. Validar em T014.
