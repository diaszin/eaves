# Quickstart: validar Agendamentos por Paciente

## Pré-requisitos

- Ambiente local rodando (Docker Compose ou `server/` + `platform/` em dev) com dados de demo
  (`server/scripts/seed-demo.mjs`) contendo pacientes com **6 ou mais** agendamentos, em datas e
  com profissionais diferentes.
- Login com papel autorizado (ex.: coordenador).

## Verificações automáticas

```bash
cd server && yarn test src/appointments    # inclui testes de GET /appointments/all
cd platform && yarn build
```

Esperado: sem erros. (`yarn lint` tem falhas preexistentes fora do escopo.)

## Cenários manuais (platform → Agendamentos)

1. **Lista por paciente (US1)**: cada paciente aparece uma única vez com "N agendamentos" e "Último:
   <data>", em ordem do mais recente; a busca reduz a lista; sem dados, mensagem de vazio.
2. **Sem truncamento (FR-005/SC-003)**: um paciente com 6+ agendamentos mostra a contagem real e todos
   no histórico.
3. **Perfil (US2)**: clicar no paciente abre identificação + histórico em ordem decrescente com data,
   horário e profissional; abrir um item mostra o detalhe (o campo "Profissional" aparece preenchido).
4. **Filtro de data (US3)**: "De"/"Até" (inclusivos; só um dos dois também funciona); "De" posterior a
   "Até" mostra aviso e não aplica.
5. **Filtro de profissional (US3)**: lista só os profissionais daquele paciente; combina com data.
6. **Sem resultados**: filtros sem correspondência mostram a mensagem e "Limpar filtros" restaura tudo.
7. **Reset**: trocar de paciente limpa os filtros.
8. **Criar agendamento (FR-013)**: "Novo Agendamento" → após salvar, a lista atualiza, o contador sobe
   e o perfil do paciente abre.
9. **Link legado (FR-015)**: abrir `/appointments/<id>` redireciona para o perfil do paciente com o
   item aberto; id inexistente mostra "Agendamento não encontrado".
10. **Sem regressão (FR-016)**: painel inicial continua exibindo seus indicadores e o app móvel
    continua listando os mesmos agendamentos (listagem `GET /appointments` ainda limitada a 5).
11. **Papéis (FR-014)**: demais papéis acessam como antes; `patient` continua sem acesso ao painel; via
    API, `GET /appointments/all` com token de paciente devolve só os agendamentos dele.

Nota: o botão "Cancelar Agendamento" não persiste hoje (servidor com `update` em stub); validar apenas
que a tela recarrega os dados após a ação (research.md D6).

Detalhes: [contracts/appointments-ui-api.md](contracts/appointments-ui-api.md), [data-model.md](data-model.md).
