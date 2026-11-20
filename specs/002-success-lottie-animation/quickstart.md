# Quickstart: validação

## Pré-requisitos
- Dentro de `app/`: `npx expo install lottie-react-native` (confere versão ~7.3.8 no `package.json`).
- Reconstruir o app nativo se usar development build (`npx expo run:android`); Expo Go dispensa.

## Verificações automáticas
- `yarn lint` em `app/` sem novos erros.
- `npx tsc --noEmit` em `app/` sem novos erros.

## Cenários manuais (ver [spec.md](spec.md))
1. Abrir uma tela consumidora (ex.: criar agendamento) e concluir a ação: o painel mostra a animação no lugar do ícone, a mensagem e "Feito com sucesso !" (FR-001, FR-002, FR-005).
2. Observar que a animação toca uma vez, sem repetir (FR-003).
3. Dispensar o painel e acionar de novo: a animação recomeça do primeiro quadro (FR-004, SC-003).
4. Verificar que `onDismiss` continua sendo chamado ao fechar (FR-006).
5. Testar modo claro e escuro, mensagem longa e a plataforma web (`yarn web`) (edge cases, FR-007).
