# Research: Animação de sucesso no botão de login

## Decisão 1: Biblioteca
- **Decision**: reutilizar `lottie-react-native` ~7.3.8, já instalada e usada em `SuccesssBottomSheet.tsx`.
- **Rationale**: nenhuma dependência nova nem novo build nativo. Funciona em iOS, Android e web.
- **Alternatives**: `@lottiefiles/dotlottie-react` (só web); animação manual com Reanimated (fora de YAGNI).
- **Verificar na implementação**: consultar https://docs.expo.dev/versions/v57.0.0/sdk/lottie/ para a assinatura de `onAnimationFinish(isCancelled)` e `loop`/`autoPlay` (exigência do `app/AGENTS.md`).

## Decisão 2: Sinal de término e redirecionamento
- **Decision**: o componente chama `onFinish` em `onAnimationFinish` (quando `isCancelled` é falso) e, em paralelo, arma um tempo limite de 3500 ms; o primeiro dos dois que ocorrer dispara `onFinish` uma única vez (guarda por `useRef`). A tela chama `router.replace("/")` dentro de `onFinish`.
- **Rationale**: a animação dura ≈ 2,33 s (70 quadros / 30 fps). Os 3500 ms dão folga para dispositivos lentos e ainda cumprem FR-008 (nunca ficar preso) e SC-002.
- **Alternatives**: só `onAnimationFinish` (risco de ficar preso se o evento não disparar, inclusive na web); `setTimeout` fixo de 2,33 s (não espera a animação real e dessincroniza).

## Decisão 3: Momento da sessão
- **Decision**: `signIn(...)` continua sendo chamado no `onSuccess` da mutation, antes da animação; só o `router.replace("/")` é adiado.
- **Rationale**: FR-009 e a edge case "sessão iniciada assim que o login é aceito". Verificado que `app/(auth)/_layout.tsx` e `app/_layout.tsx` não redirecionam automaticamente quando `isAuthenticated` muda, então a tela de login permanece visível durante a animação.
- **Alternatives**: chamar `signIn` só no fim (atrasa a sessão e arrisca perder o login se o app for fechado durante a animação).

## Decisão 4: Estado na tela de login
- **Decision**: `const [successButton, setSuccessButton] = useState<"email" | "microsoft" | null>(null)`. O `onSuccess` das duas mutations faz `await signIn(...)` e `setSuccessButton(...)`. Cada botão mostra a animação quando `successButton` aponta para ele.
- **Rationale**: simples, impede que as duas animações apareçam juntas e permite desabilitar os dois botões enquanto `successButton !== null`.
- **Alternatives**: estado dentro do componente do botão (não conhece o resultado da mutation); `mutate.isSuccess` direto (não distingue o fim da animação e continua `true` após o redirecionamento).

## Decisão 5: Visual dentro do botão (clarificação: fundo verde)
- **Decision**: com `successButton` ativo, o botão usa fundo verde `#00C885` (mesma cor da animação, `[0,0.784,0.522]`), mantém `min-h-12` e centraliza a animação em caixa de 40x40 (cabe nos 48px). No botão da Microsoft, remover a borda cinza durante a animação para o verde preencher o botão.
- **Rationale**: o círculo verde da animação some contra um fundo verde, ficando só o check branco, legível. A caixa fixa 40x40 evita mudar a altura (SC-003), já que o conteúdo anterior (texto 1 linha) tinha altura menor que 48px.
- **Alternatives**: manter a cor atual ou fundo branco (descartadas na clarificação).

## Decisão 6: Toques repetidos e desmontagem
- **Decision**: `disabled` nos dois botões enquanto `successButton !== null`; a guarda `useRef` garante um único `onFinish`; o tempo limite é limpo no `useEffect` de desmontagem.
- **Rationale**: FR-005, SC-005 e a edge case de sair da tela durante a animação.

## Decisão 7: Movimento reduzido
- **Decision**: não tratar nesta versão (conforme Assumptions da spec).
