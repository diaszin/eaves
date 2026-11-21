# Bug Fix: Bottom sheet de sucesso não aparece ao finalizar o cadastro

- **Slug**: signup-success-sheet-missing
- **Fixed**: 2026-11-20
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary

O cadastro passa a exibir o `SuccessBottomSheet` quando a conta é criada e só navega para o login quando o sheet é dispensado, seguindo o padrão de `reset-password.tsx`.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `app/src/features/auth/screens/signup.tsx` | modified | Importa `SuccessBottomSheet`, cria o estado `accountCreated`, liga o estado no `onSuccess` (antes fazia `router.replace`) e renderiza o sheet ao lado do `ErrorBottomSheet`; `onDismiss` desliga o estado e faz `router.replace("/(auth)/sign-in")`. |

## Diff Highlights

```tsx
const [accountCreated, setAccountCreated] = useState(false);
// ...
onSuccess: () => {
  setAccountCreated(true);
},
// ...
<SuccessBottomSheet
  messsage="Sua conta foi criada com sucesso."
  isOpen={accountCreated}
  onDismiss={() => {
    setAccountCreated(false);
    router.replace("/(auth)/sign-in");
  }}
/>
```

## Tests Added or Updated

- Nenhum: o app não tem suíte de testes automatizados (conforme a avaliação). Validação manual descrita abaixo.

## Local Verification

- `npx tsc --noEmit` (app) → sem erros.
- `npx eslint src/features/auth/screens/signup.tsx` → sem erros nem avisos.
- Verificação manual pendente (executar com `/speckit-bug-test`): cadastro com sucesso mostra o sheet e, ao dispensar, vai para o login; cadastro com erro continua mostrando só o `ErrorBottomSheet`.

## Deviations from Assessment

Nenhuma.

## Follow-ups

- Risco apontado na avaliação (reenvio com o sheet aberto): o sheet é modal e cobre a tela, então não foi adicionada trava extra. Confirmar no teste manual.
- O texto "Feito com sucesso !" do componente compartilhado tem espaço antes da exclamação; ajuste cosmético fora do escopo deste bug.
