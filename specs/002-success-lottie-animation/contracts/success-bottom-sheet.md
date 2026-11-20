# Contrato de UI: SuccessBottomSheet

Props (inalteradas, para não afetar as 7 telas consumidoras):

| Prop | Tipo | Obrigatória | Descrição |
|------|------|-------------|-----------|
| `messsage` | string | sim | Mensagem exibida (grafia atual da prop mantida) |
| `isOpen` | boolean | sim | Controla a exibição do painel |
| `onDismiss` | () => void | não | Chamado ao dispensar o painel |

Comportamento visual:
- No topo do painel, a animação de sucesso substitui o ícone de check; toca uma vez ao abrir.
- Abaixo: mensagem e o texto "Feito com sucesso !" (inalterados).
- Reabrir reinicia a animação.
- Falha ao carregar a animação não impede a exibição dos textos.

Consumidores (sem mudança de uso): appointments-create, forgot-password, reset-password,
personal-journal-create, change-password, edit-profile, phq.
