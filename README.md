# Eaves

Eaves é um projeto acadêmico voltado ao bem-estar e à saúde mental de estudantes universitários. O aplicativo e sua API formam a base para apoiar o cuidado pessoal diante das demandas acadêmicas e da vida cotidiana.

## Componentes

- `app/`: aplicativo mobile e web feito com React Native, Expo e TypeScript. A navegação usa Expo Router.
- `server/`: API REST em NestJS, com autenticação, controle de acesso e persistência em PostgreSQL.
- `docker-compose.yml`: ambiente local com API e banco de dados.
- `docker-compose.prod.yml`: configuração de containers para execução em produção.

## Requisitos

- Node.js compatível com Expo e NestJS.
- npm para o aplicativo; Yarn 1.22.22 para o servidor e o build de produção.
- Docker Desktop e Docker Compose para subir a API e o banco juntos.

## Início rápido com Docker

1. Crie `server/.env` com as configurações do PostgreSQL, da API e do JWT. Exemplo para desenvolvimento:
   
   ```env
   POSTGRES_USER=eaves
   POSTGRES_PASSWORD=change-me
   POSTGRES_DB=eaves
   POSTGRES_HOST=eaves-db
   POSTGRES_PORT=5432
   DATABASE_URL=postgresql://eaves:change-me@eaves-db:5432/eaves
   JWT_SECRET=replace-with-a-long-random-secret
   ALLOWED_ORIGINS=http://localhost:8081
   PORT=3000
   ```
   
   Use valores próprios para senhas e segredos. O arquivo `.env` não deve ser versionado.

2. Na raiz do repositório, inicie os serviços:
   
   ```bash
   docker compose up --build
   ```

3. Em outro terminal, configure e inicie o aplicativo:
   
   ```bash
   cd app
   npm install
   ```
   
   Crie `app/.env` e configure a URL da API:
   
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```
   
   Para testar em um celular físico, substitua `localhost` pelo IP local do computador, por exemplo `http://192.168.1.20:3000`.
   
   ```bash
   npx expo start
   ```

A documentação interativa da API fica em [http://localhost:3000/api](http://localhost:3000/api). Os comandos de cada parte estão detalhados em [app/README.md](app/README.md) e [server/README.md](server/README.md).

## Arquitetura e padrões de projeto

O repositório segue uma arquitetura cliente-servidor. O aplicativo Expo concentra a interface e a navegação; a API NestJS concentra as regras de negócio e a persistência em PostgreSQL. A comunicação entre as partes é feita por HTTP.

```mermaid
flowchart LR
  A[Rotas e telas<br/>Expo Router] --> B[Features e serviços]
  B --> C[Cliente HTTP<br/>Axios]
  C --> D[DTOs e validação<br/>NestJS ValidationPipe]
  D --> E[Controllers]
  E --> F[Services]
  F --> G[Repositórios TypeORM]
  G --> H[(PostgreSQL)]
```

### Aplicativo

- **Organização por funcionalidade (feature-driven):** `app/src/features/` agrupa telas, componentes, hooks, serviços e tipos relacionados a cada domínio, como autenticação.
- **Rotas separadas da interface:** `app/src/app/` contém os layouts e pontos de entrada do Expo Router; as telas e a lógica de cada funcionalidade ficam em `features/`.
- **Infraestrutura compartilhada:** `app/src/components/`, `app/src/hooks/` e `app/src/shared/` concentram elementos reutilizáveis, estado compartilhado e integrações comuns, como o cliente HTTP.
- **Dados e formulários:** TanStack Query gerencia operações assíncronas nas telas de autenticação, e TanStack Form estrutura os formulários.

### API

- **Monólito modular por domínio:** os módulos `auth` e `appointments` encapsulam os componentes de cada área e são registrados na aplicação NestJS.
- **Arquitetura em camadas:** controllers recebem requisições HTTP, services concentram operações de negócio e entidades/repositórios TypeORM fazem o acesso aos dados.
- **Injeção de dependência:** módulos NestJS declaram controllers e providers; dependências, como repositórios TypeORM, são fornecidas pelo container.
- **DTOs e validação:** DTOs definem os dados de entrada, e o `ValidationPipe` global valida e transforma os parâmetros das requisições.
- **Autorização por políticas:** as políticas de domínio verificam permissões com base no usuário e no papel associado à operação.

Esses padrões podem ser observados, por exemplo, em `app/src/features/auth/`, `server/src/appointments/` e `server/src/auth/`.

## Funcionalidades da API

- Cadastro e login em `/auth`.
- Operações de consulta e gerenciamento de agendamentos em `/appointments`, protegidas por autenticação e regras de autorização.
- Validação de dados de entrada e documentação Swagger em `/api`.

## Licença

Consulte os arquivos de licença de cada componente do projeto antes de redistribuí-lo.