# Quickstart: validar as transições na web

## Pré-requisitos

- Em `app/`: `yarn web` (abre o app no navegador) ou `yarn build:web` e servir a pasta `dist`.
- Conta de paciente e ao menos 3 profissionais cadastrados (ver `server/scripts/seed-demo.mjs`).
- Chrome ou Edge atuais para os cenários completos; repetir os cenários 1, 2 e 6 em Firefox e Safari.

## Verificações estáticas

Em `app/`: `npx tsc --noEmit` e `npx eslint src --quiet` sem erros novos.

## Cenários manuais

1. **Fade through** (US1): navegar Início → Perfil → Alterar dados e voltar; Diário → Novo registro; Login → Cadastro; abrir Termos legais. Cada troca esmaece a nova tela, sem corte seco. (FR-001)
2. **Abas**: alternar entre as três abas do início; troca por fade. (US1 cenário 3)
3. **Hero na ida** (US2): em "Procurar consultas", clicar no 2º profissional. O card dele se expande até o cabeçalho de "Agendar consulta"; os demais não se movem. (FR-002, FR-004, SC-002)
4. **Hero na volta e botões do navegador**: voltar pelo botão do app, depois repetir usando voltar e avançar do navegador. O cabeçalho se recolhe ao card certo; se o navegador não animar o Hero, a volta ao menos esmaece. (FR-003, FR-005)
5. **Recarregar na tela de agendamento**: com a tela de agendamento aberta, recarregar a página. Carrega sem erro e sem Hero. (FR-006)
6. **Sem suporte**: em navegador sem *View Transitions* (ou desligando-a nas ferramentas de desenvolvimento), repetir o cenário 3. Navegação conclui com fade. (FR-007)
7. **Reduzir movimento**: ativar a opção de reduzir movimento do sistema e repetir 1–4. Nenhuma animação de deslocamento; trocas simples. (FR-008, SC-006)
8. **Cliques repetidos**: clicar várias vezes no mesmo card e usar voltar do navegador durante a animação. Uma única tela de agendamento, sem card preso. (FR-009, SC-005)
9. **Endereço e comportamento**: conferir que o endereço de cada tela é o mesmo de antes e que concluir um agendamento funciona. (FR-010)
10. **Móvel intacto**: abrir no Android/iOS e repetir o cenário 3 da feature 007. Sem regressão. (FR-011, SC-007)
11. **Duração**: gravar a tela (ferramentas de desempenho) e conferir transições entre 200 e 500 ms. (SC-003)
