# Quickstart: validar Cancelar Agendamento

## Pré-requisitos

- Ambiente local com `server/`, `platform/` e `app/` (Expo) rodando e banco com dados de demo
  (`server/scripts/seed-demo.mjs`): um paciente com agendamentos futuros e passados, mais de um
  profissional, e contas de coordenador, recepção, professor/estagiário e paciente.
- A migração roda sozinha na subida da API (`migrationsRun: true`); conferir com
  `yarn migration:show` em `server/`.

## Verificações automáticas

```bash
cd server && yarn test src/appointments      # service, controller, policy
cd platform && yarn build
cd app && npx tsc --noEmit
```

Esperado: sem erros.

## Cenários (painel)

1. **Migração (FR-002/SC-006)**: após subir a API, todos os agendamentos antigos aparecem como Agendado.
2. **Cancelar (US1)**: como coordenador, abrir um agendamento futuro ativo → "Cancelar Agendamento" →
   "Confirmar cancelamento" → selo vira Cancelado; recarregar a página: continua Cancelado e sem o botão.
3. **Desistir**: clicar em "Voltar" na confirmação não altera nada.
4. **Encerrado/já cancelado**: um agendamento passado ou já cancelado não mostra o botão; via API,
   cancelar de novo devolve 400 com a mensagem esperada.
5. **Permissões (SC-004)**: com token de professor/estagiário, `PATCH /appointments/:id/cancel` → 403;
   com token de paciente em agendamento de outro paciente → 403; agendamento inexistente → 404.
6. **Histórico (US2)**: no perfil do paciente, itens cancelados mostram "Cancelado" e os demais "Agendado".
7. **Painel inicial (SC-007)**: o cancelado não conta em "hoje" nem em "próximos".
8. **Liberar horário (US3/SC-005)**: após cancelar, criar novo agendamento do mesmo profissional no
   mesmo horário é aceito; com agendamento ativo no horário, continua sendo recusado.

## Cenários (aplicativo móvel — paciente)

9. **Status e cancelar (US4)**: na home, a lista mostra o selo; em um agendamento ativo e futuro,
   "Cancelar" → "Confirmar cancelamento" → o item passa a Cancelado sem recarga manual; o cancelado
   e os encerrados não mostram o botão.
10. **Erro**: com a API indisponível, o cancelamento mostra mensagem clara e o status anterior permanece.
11. **Sem regressão**: criar e listar agendamentos no app continuam funcionando.

Detalhes: [contracts/cancel-appointment-api.md](contracts/cancel-appointment-api.md), [data-model.md](data-model.md).
