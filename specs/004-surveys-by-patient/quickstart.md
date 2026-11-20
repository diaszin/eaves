# Quickstart: validar Pesquisas por Paciente

## Pré-requisitos

- Ambiente local rodando (Docker Compose ou `server/` + `platform/` em dev) com dados de demo
  (`server/scripts/seed-demo.mjs`) contendo pacientes com várias respostas PHQ-9 em datas diferentes.
- Login com um papel autorizado (ex.: coordenador).

## Verificações automáticas

```bash
cd server && yarn lint && yarn test      # inclui survey.service.spec.ts (campo category)
cd platform && yarn build && yarn lint
```

Esperado: sem erros.

## Cenários manuais (platform → Pesquisas)

1. **Lista por paciente (US1)**: cada paciente aparece uma única vez, com "N respostas" e data da
   última; ordem pela resposta mais recente; buscar parte do nome/e-mail reduz a lista; sem dados,
   aparece mensagem de vazio.
2. **Perfil (US2)**: clicar em um paciente abre, no painel direito, identificação + histórico em
   ordem decrescente; abrir uma resposta mostra o detalhe por questão e o menu de exportação
   (Excel/PDF) continua funcionando.
3. **Filtro de data (US3)**: definir "De" e "Até" mostra só respostas no intervalo (inclusive nas
   pontas); só "De" ou só "Até" também funciona; "De" posterior a "Até" mostra aviso e não aplica.
4. **Filtro de categoria (US3)**: a lista contém "Todas" e "PHQ-9"; selecionar PHQ-9 mantém as
   respostas; combinado com data respeita os dois critérios.
5. **Sem resultados**: um intervalo sem respostas mostra "Nenhuma pesquisa encontrada para os
   filtros selecionados" e "Limpar filtros" restaura o histórico completo.
6. **Reset ao trocar de paciente**: com filtros aplicados, selecionar outro paciente volta ao padrão.
7. **Link legado (FR-014)**: abrir `/surveys/<id de uma resposta>` exibe o perfil do paciente dono
   com aquela resposta aberta; id inexistente mostra "não encontrado".
8. **Papéis (FR-013)**: usuário `patient` continua sem acesso ao painel; demais papéis atuais acessam
   como antes.

Detalhes: [contracts/surveys-ui-api.md](contracts/surveys-ui-api.md), [data-model.md](data-model.md).
