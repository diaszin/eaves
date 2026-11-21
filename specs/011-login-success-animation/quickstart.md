# Quickstart: validar a animação de sucesso no login

## Pré-requisitos

- API rodando e uma conta válida (e-mail/senha). Para o cenário Microsoft, uma conta Microsoft já cadastrada.
- No diretório `app/`: `yarn install` (a `lottie-react-native` já está instalada; não há novo build nativo).

## Verificações estáticas

```bash
cd app
yarn lint
npx tsc --noEmit
```

Esperado: sem novos erros.

## Cenários manuais (`yarn start`; testar web e um dispositivo/emulador)

1. **Login aceito (US1)**: informar credenciais válidas e tocar em "Entrar".
   Esperado: botão fica verde, a animação de check toca dentro dele (sem mudar altura/largura) e só depois a tela inicial abre (SC-001, SC-002, SC-003).
2. **Toques repetidos**: tocar várias vezes no botão durante a animação.
   Esperado: nenhum novo envio; um único redirecionamento (FR-005, SC-005).
3. **Login recusado**: senha errada.
   Esperado: sem animação, botão volta ao normal, mensagem de erro existente aparece (FR-006, SC-004).
4. **Microsoft, conta existente (US2)**: concluir o login Microsoft.
   Esperado: animação dentro do botão da Microsoft, verde, depois redirecionamento (FR-007).
5. **Microsoft, conta incompleta**: usar conta sem cadastro.
   Esperado: vai ao cadastro, sem animação de sucesso.
6. **Tempo limite**: simular ausência do evento de término (por exemplo, forçando o `onAnimationFinish` a não disparar em ambiente de teste).
   Esperado: redirecionamento em até ~3,5 s (FR-008).
7. **Sair durante a animação**: fechar o app/voltar durante a animação.
   Esperado: sem erro nem redirecionamento duplicado.
8. **Larguras diferentes**: telas pequena e grande (e janela web redimensionada).
   Esperado: animação centralizada, sem corte.

Detalhes de interface em [contracts/button-success-check.md](contracts/button-success-check.md); estado em [data-model.md](data-model.md).
