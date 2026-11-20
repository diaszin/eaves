# Data Model: Transições entre Telas na Web

Nenhuma entidade, coluna ou migração. A feature é visual e usa apenas dados já carregados.

Estados em memória no navegador:

| Nome | Descrição |
|------|-----------|
| Transição ativa | Booleano global que indica se uma view transition está em andamento. O envoltório de Fade through o lê para não animar em duplicidade. |
| Nome de transição do profissional | Texto `professional-card-{id}`, aplicado ao card somente enquanto ele está na navegação em curso. |
