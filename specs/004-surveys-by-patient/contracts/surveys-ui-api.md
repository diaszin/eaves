# Contratos: Pesquisas por Paciente

## API (server) — mudança aditiva

Endpoints inalterados, mesma autorização (`SurveyPolicy.viewResponses`: coordinator, professor,
lobby, trainee; `patient` sem acesso).

- `GET /survey/phq/daily/responses`
- `GET /survey/phq/daily/responses/:id`

Cada objeto de resposta ganha o campo:

```json
{ "category": "PHQ" }
```

Compatibilidade: campo extra; clientes que o ignoram (app móvel) não são afetados. Documentar no
Swagger se o endpoint já estiver anotado.

## Rotas do painel

| Rota | Comportamento |
|------|---------------|
| `/surveys` | Lista de pacientes à esquerda; painel direito vazio ("Selecione um paciente") |
| `/surveys/patient/:patientId` | Perfil do paciente: identificação, filtros e histórico |
| `/surveys/patient/:patientId?response=:id` | Igual, com a resposta `:id` aberta no detalhe |
| `/surveys/:id` | Legado (FR-014): resolve o paciente dono da resposta `:id` e exibe o perfil com ela aberta; id inexistente mostra mensagem de não encontrado |

## Contrato de UI

**Lista (painel esquerdo)**: uma linha por paciente com nome (ou e-mail), "N respostas" e data da
última; item ativo destacado; busca por nome/e-mail; estados: carregando, erro, vazio ("Nenhuma
pesquisa encontrada").

**Perfil (painel direito)**:
1. Cabeçalho: avatar, nome/e-mail, total de respostas.
2. Filtros: "De" (data), "Até" (data), "Categoria" (padrão "Todas"), botão "Limpar filtros"; aviso
   "A data inicial não pode ser posterior à final." quando inválido.
3. Histórico: itens da resposta mais recente à mais antiga com data, pontuação `N/27` e selo de
   gravidade; item selecionado abre o detalhe por questão com o `ExportMenu` existente.
4. Vazio com filtros: "Nenhuma pesquisa encontrada para os filtros selecionados" + ação "Limpar filtros".

Textos em pt-BR.
