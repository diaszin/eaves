# Data Model

Funcionalidade puramente visual; não há entidades persistidas nem mudanças de schema.

## Entidade de interface

**Animação de sucesso** (asset estático): `app/assets/animations/json/success.json`, 300x300, 30 fps,
60 quadros (2 s). Somente leitura; não é modificada.

## Estado do componente

| Estado | Origem | Efeito |
|--------|--------|--------|
| `isOpen` | prop existente | `true` exibe o painel e inicia a animação do primeiro quadro; `false` oculta |

Transição: fechado → aberto reinicia a animação; aberto → fechado descarta o estado de reprodução.
