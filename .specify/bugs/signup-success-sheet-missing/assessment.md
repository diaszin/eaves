# Bug Assessment: Bottom sheet de sucesso não aparece ao finalizar o cadastro

- **Slug**: signup-success-sheet-missing
- **Created**: 2026-11-20
- **Source**: pasted text
- **Verdict**: valid
- **Severity**: low

## Report (verbatim or summarized)

> Ao finalizar o cadastro na tela de signup, não é mostrado o bottom sheet de sucesso

## Symptom

Ao concluir o cadastro ("Criar minha conta"), o app navega direto para a tela de login sem exibir o `SuccessBottomSheet`. O esperado, seguindo o padrão das demais telas (redefinir senha, alterar senha, editar perfil), é mostrar o bottom sheet de sucesso e só navegar quando ele for dispensado.

## Reproduction

1. Abrir a tela de cadastro e preencher as três etapas (dados pessoais, comunicação, autenticação).
2. Tocar em "Criar minha conta" com a API respondendo com sucesso.
3. Observar: a tela de login aparece imediatamente, sem nenhum bottom sheet de sucesso.

## Suspected Code Paths

- `app/src/features/auth/screens/signup.tsx` (`useMutation`, `onSuccess`) — chama `router.replace("/(auth)/sign-in")` imediatamente; a tela só renderiza `ErrorBottomSheet` e nunca importa nem renderiza `SuccessBottomSheet`.
- `app/src/features/auth/screens/reset-password.tsx` (`passwordChanged`, `onSuccess`, `onDismiss`) — implementação de referência: `onSuccess` liga um estado, o sheet mostra a mensagem e `onDismiss` desliga o estado e faz `router.replace`.
- `app/src/components/SuccesssBottomSheet.tsx` — componente reutilizável (props `messsage`, `isOpen`, `onDismiss`), sem alterações necessárias.

## Root Cause Hypothesis

Omissão no fluxo de cadastro: o `onSuccess` da mutação faz o redirecionamento direto em vez de acionar o bottom sheet, e a tela nunca monta o `SuccessBottomSheet`. Confiança: alta (confirmada pela leitura do código; `git log` mostra que a tela nunca teve o sheet de sucesso).

## Proposed Remediation

**Preferred**: em `signup.tsx`, criar o estado `accountCreated` (`useState(false)`); no `onSuccess` da mutação chamar `setAccountCreated(true)` em vez de `router.replace`; renderizar `<SuccessBottomSheet messsage="Sua conta foi criada com sucesso." isOpen={accountCreated} onDismiss={() => { setAccountCreated(false); router.replace("/(auth)/sign-in"); }} />` ao lado do `ErrorBottomSheet`. Mesmo padrão de `reset-password.tsx`.

**Alternatives**:
- Navegar para o login e exibir o sheet lá via parâmetro de rota: mais acoplamento entre telas, sem ganho.

**Files likely to change**:
- `app/src/features/auth/screens/signup.tsx`

**Tests to add or update**:
- O app não tem suíte de testes automatizados; validar manualmente: cadastro com sucesso mostra o sheet e, ao dispensá-lo, vai para o login; cadastro com erro continua mostrando o `ErrorBottomSheet` e não mostra o de sucesso.

## Risks & Considerations

- O botão "Criar minha conta" fica desabilitado só durante o envio (`isSubmitting`); com o sheet aberto o usuário não deve conseguir enviar de novo. Conferir que `mutateAsync` concluído não reabilita um segundo envio enquanto o sheet está visível.
- Se o usuário dispensar o sheet por gesto, `onDismiss` precisa garantir a navegação (como em `reset-password.tsx`), senão ele fica preso na tela de cadastro.
- Mensagem em português do Brasil, conforme a constituição do projeto.

## Open Questions

- Nenhuma.
