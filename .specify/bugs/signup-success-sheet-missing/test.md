# Bug Verification: Bottom sheet de sucesso não aparece ao finalizar o cadastro

- **Slug**: signup-success-sheet-missing
- **Tested**: 2026-11-21
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: partial

## Summary

As verificações estáticas passam (tipos, lint sem erros e build web), e a leitura do código confirma que o sheet de sucesso agora é montado e que a navegação só ocorre no `onDismiss`. A reprodução em execução (cadastro real no app) não foi exercitada, por isso o resultado é `partial` e não `verified`.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Cadastro completo no app (3 etapas, "Criar minha conta") | not-run | Sem emulador/navegador interativo e sem backend nesta sessão. |
| Inspeção do código | Leitura de `app/src/features/auth/screens/signup.tsx` | pass | `onSuccess` agora chama `setAccountCreated(true)`; `SuccessBottomSheet` montado com `isOpen={accountCreated}`; `router.replace("/(auth)/sign-in")` só dentro de `onDismiss`. |
| New / updated tests | n/a | not-run | O app não tem suíte de testes; o fix não adicionou testes. |
| Regression suite | n/a | not-run | Não existe suíte de testes no app. |
| Type-check | `npx tsc --noEmit` (app) | pass | Saída vazia, exit 0. |
| Lint | `npx eslint src/features/auth/screens/signup.tsx` | pass | 0 erros, 7 avisos que já existiam (imports não usados `createContext`, `FormOptions`, `Stack`, `MdChevronLeft` e `==` em vez de `===`). |
| Build web | `yarn build:web` (app) | pass | "Exported: dist", exit 0. |

## Output Excerpts

```
tsc --noEmit            -> (sem saída), exit 0
eslint signup.tsx       -> ✖ 7 problems (0 errors, 7 warnings)
yarn build:web          -> Exported: dist / Done in 69.59s.
```

## Residual Risks

- **Fluxo não exercitado em execução:** não foi confirmado visualmente que o sheet abre, mostra a animação e, ao dispensar (botão ou gesto), leva ao login. O `BottomSheet` de `@expo/ui` pode se comportar diferente entre Android, iOS e web.
- **Reenvio com o sheet aberto:** o botão só é desabilitado durante o envio; confiar que o sheet modal cobre a tela é uma suposição não testada.
- **Caminho de erro:** não foi exercitado que um cadastro com falha continua mostrando só o `ErrorBottomSheet`; a leitura indica que sim, pois `onSuccess` não roda em erro.
- **Correção ao fix.md:** o relatório do fix afirma que o eslint passou "sem erros nem avisos"; na verdade há 7 avisos pré-existentes (nenhum em linhas alteradas pelo fix).

## Recommendation

Manter em espera até um teste manual rápido: preencher o cadastro com sucesso e confirmar que o sheet aparece e que dispensá-lo leva ao login; depois repetir com um erro de API (por exemplo, e-mail já cadastrado) e confirmar que só o sheet de erro aparece. Se esses dois passos funcionarem, o bug pode ser fechado como verificado.
