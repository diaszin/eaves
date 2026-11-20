# Data Model: Animações de Transição entre Telas

Nenhuma entidade, coluna ou migração. A feature é visual e usa apenas dados já carregados.

Única estrutura nova é um valor de configuração em memória:

| Nome | Descrição |
|------|-----------|
| Tag de elemento compartilhado | Texto `professional-card-{id}`, em que `id` é o id do profissional. Deve ser idêntica no card da lista e no card da tela de agendamento, e única por profissional. |
