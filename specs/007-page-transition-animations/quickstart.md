# Quickstart: validar as transições

## Pré-requisitos

- Build de desenvolvimento do app (não usar Expo Go): a flag nativa do Reanimated exige rebuild.
- Rebuild após mudar `package.json` (`reanimated.staticFeatureFlags`): `yarn android` (ou `npx expo run:android`) em `app/`.
- Conta de paciente e ao menos 3 profissionais cadastrados (ver `server/scripts/seed-demo.mjs`).

## Verificações estáticas

Em `app/`: `yarn lint` e checagem de tipos (`npx tsc --noEmit`) sem erros.

## Cenários manuais

1. **Hero na ida** (US1): aba "Procurar consultas" → tocar no 2º profissional. O card dele se desloca da posição na lista até o topo de "Agendar consulta"; os demais cards não se movem. (FR-001, FR-003, SC-002)
2. **Hero na volta**: voltar pelo botão/gesto. O cabeçalho retorna ao card do mesmo profissional. (FR-002)
3. **Lista rolada**: rolar a lista, tocar em um card parcialmente visível. A animação parte da posição atual dele.
4. **Fade nas demais** (US2): Início → Perfil → Alterar dados e voltar; Diário → Novo registro; sair e ir de Login → Cadastro; abrir Termos legais. Todas por esmaecimento, sem slide. (FR-004, FR-006)
5. **Abas**: alternar entre as três abas; troca por fade. (US2 cenário 3)
6. **Toques repetidos**: tocar 5 vezes rápido no mesmo card e voltar durante a animação. Uma única tela de agendamento, sem card preso. (FR-007, SC-005)
7. **Reduzir movimento**: ativar "Remover animações" nas configurações do Android e repetir 1–5. Nenhum deslocamento de card; trocas sem animação. (FR-008, SC-006)
8. **Duração**: gravar a tela e conferir transições entre 200 e 500 ms. (SC-003)
9. **Sem regressão**: concluir um agendamento completo; resultado igual ao anterior. (FR-009, SC-004)
