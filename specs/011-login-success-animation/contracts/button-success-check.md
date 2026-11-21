# Contrato de UI: ButtonSuccessCheck

Componente em `app/src/shared/components/button-success-check.tsx`, usado dentro de um botão.

## Props

| Prop | Tipo | Obrigatória | Descrição |
|------|------|-------------|-----------|
| `onFinish` | `() => void` | sim | Chamado uma única vez quando a animação termina ou o tempo limite (3500 ms) expira |
| `size` | `number` | não | Lado da caixa em px. Padrão: 40 |

## Comportamento

- Ao montar, toca `check-mark.json` uma vez (`autoPlay`, sem loop), centralizada, na caixa `size` x `size`.
- Fim natural da animação (não cancelada) → `onFinish`.
- Sem sinal de término em 3500 ms → `onFinish`.
- `onFinish` nunca é chamado duas vezes; o tempo limite é cancelado ao desmontar.
- Não renderiza texto nem altera o layout do botão pai além da caixa fixa.

## Uso na tela de login

| Botão | Condição para exibir | Fundo | Ao terminar |
|-------|----------------------|-------|-------------|
| "Entrar" | `successButton === "email"` | verde `#00C885` | `router.replace("/")` |
| "Continuar com Microsoft" | `successButton === "microsoft"` | verde `#00C885`, sem borda | `router.replace("/")` |

Ambos ficam `disabled` enquanto `successButton !== null`.
