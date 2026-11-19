# Quickstart: validar o gráfico de agendamentos do estagiário

## Pré-requisitos

- `server/.env` configurado (ver `README.md`) e Docker Desktop em execução.
- Ambiente no ar: `docker compose up --build` na raiz (API em `http://localhost:3000`, plataforma em `http://localhost:5173`).
- Dados de demonstração: `yarn seed:demo` em `server/` (cria estagiários e agendamentos); ou criar agendamentos pela plataforma escolhendo o estagiário como profissional.
- Um usuário `coordinator` para login; um `professor` e um `lobby` para os testes negativos.

## Testes automatizados (servidor)

```bash
cd server
yarn test
yarn lint
```

Esperado: passam os testes da policy (`coordinator` permitido; `professor`, `lobby`, `trainee`, `patient` e usuário nulo negados) e do serviço (6 meses, zeros preenchidos, só `professional`).

## Build da plataforma

```bash
cd platform
yarn build
yarn lint
```

Esperado: sem erros.

## Roteiro manual

1. Entrar na plataforma como coordenador e abrir `Estagiários` (`/trainees`).
2. Selecionar um estagiário com agendamentos em meses diferentes: o gráfico aparece nos detalhes com 6 barras; as alturas batem com a contagem manual por mês (SC-002).
3. Passar o cursor numa barra: aparece o mês e o número exato (FR-005).
4. Selecionar outro estagiário: o gráfico muda e não mostra dados do anterior (FR-006).
5. Selecionar um estagiário sem agendamentos: aparece "Nenhum agendamento nos últimos 6 meses" (FR-007).
6. Parar a API e selecionar um estagiário: mensagem de erro no gráfico, restante do detalhe visível (FR-008).
7. Entrar como recepcionista: o gráfico não aparece na tela de estagiários.
8. Chamar o endpoint com token de professor, recepcionista, estagiário ou paciente: resposta 403 (FR-009). Ver [contrato](./contracts/trainee-appointments-monthly.md).
9. Conferir que a resposta do endpoint contém só `month` e `count` (FR-011).

## Resultado esperado

Todos os passos acima se comportam como descrito e o gráfico aparece em até 2 s (SC-001).
