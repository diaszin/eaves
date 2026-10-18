# API Eaves

API REST do projeto Eaves, construída com NestJS, TypeScript e PostgreSQL. Ela oferece autenticação, autorização e gerenciamento de agendamentos. A documentação interativa Swagger é servida em `/api`.

## Requisitos

- Node.js e Yarn 1.22.22 (o projeto inclui `yarn.lock`).
- PostgreSQL 17, localmente ou via Docker.

## Configuração local

Na pasta `server/`, crie um arquivo `.env`:

```env
POSTGRES_USER=eaves
POSTGRES_PASSWORD=change-me
POSTGRES_DB=eaves
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://eaves:change-me@localhost:5432/eaves
JWT_SECRET=replace-with-a-long-random-secret
MICROSOFT_CLIENT_ID=seu-client-id-do-entra
ALLOWED_ORIGINS=http://localhost:8081
PORT=3000
```

`DATABASE_URL` é obrigatório. Os valores de usuário, senha e banco devem corresponder ao PostgreSQL em uso. Não versione `.env` nem use os valores de exemplo em produção.

Instale as dependências e execute a API em modo de desenvolvimento:

```bash
yarn install
yarn start:dev
```

Por padrão, a API fica em `http://localhost:3000` e o Swagger em `http://localhost:3000/api`.

## Executar com Docker Compose

O Compose da raiz inicializa a API e o PostgreSQL. Configure `server/.env` primeiro, usando `POSTGRES_HOST=eaves-db`, e então execute na raiz do repositório:

```bash
docker compose up --build
```

Para acompanhar os logs da API:

```bash
docker compose logs -f api
```

## Rotas disponíveis

- `POST /auth/signup`: cria uma conta.
- `POST /auth/login`: autentica e retorna os dados de acesso.
- `POST /auth/microsoft`: troca um código OAuth com PKCE por uma sessão Eaves.
- `/appointments`: cria e lista agendamentos do usuário autenticado.
- `/appointments/:id`: consulta, atualiza ou remove um agendamento.

Consulte o Swagger para os esquemas de entrada e resposta. As rotas protegidas exigem autenticação; as políticas de autorização são aplicadas conforme a operação.

## Testes e qualidade

```bash
yarn test
yarn test:e2e
yarn test:cov
yarn lint
yarn build
```

`test` executa a suíte unitária, `test:e2e` executa os testes end-to-end e `test:cov` gera cobertura.

## Migrações

Os scripts de migração usam `DATABASE_URL` e `src/data-source.ts`:

```bash
yarn migration:show
yarn migration:run
yarn migration:revert
```

Para gerar uma migração a partir de alterações no modelo, informe o caminho e o data source:

```bash
yarn migration:generate src/migration/NomeDaMigracao -d src/data-source.ts
```

Em desenvolvimento, o TypeORM também sincroniza o schema automaticamente; em produção essa sincronização fica desativada, então valide e execute migrações explicitamente.

## Aplicativo

Para iniciar o app mobile e configurar a URL da API, consulte o [README do aplicativo](../app/README.md) ou o [README principal](../README.md).
