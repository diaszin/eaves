# Eaves

Eaves é um projeto acadêmico voltado ao bem-estar e à saúde mental de estudantes universitários. O ecossistema é composto por aplicativo móvel, plataforma de gestão backoffice e API REST.

## Componentes

- `app/`: aplicativo mobile e web feito com React Native, Expo e TypeScript. A navegação usa Expo Router.
- `platform/`: plataforma backoffice web feita com React, TypeScript, Vite e Tailwind CSS, seguindo o padrão Three-Pane Application Layout, voltada para coordenadores, professores, recepcionistas, estagiários e supervisores.
- `server/`: API REST em NestJS, com autenticação, controle de acesso e persistência em PostgreSQL.
- `docker-compose.yml`: ambiente local com API, plataforma backoffice (`platform`) e banco de dados.
- `docker-compose.prod.yml`: configuração de containers para execução em produção.

## Requisitos

- Node.js compatível com Expo e NestJS.
- npm para o aplicativo e plataforma; Yarn 1.22.22 para o servidor e o build de produção.
- Docker Desktop e Docker Compose para subir a API, a plataforma e o banco juntos.

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
   ALLOWED_ORIGINS=http://localhost:8081,http://localhost:5173
   PORT=3000
   ```
   
   Use valores próprios para senhas e segredos. O arquivo `.env` não deve ser versionado.

2. Na raiz do repositório, inicie os serviços (API, Banco e Plataforma Backoffice):
   
   ```bash
   docker compose up --build
   ```

   - A plataforma backoffice estará disponível em: [http://localhost:5173](http://localhost:5173)
   - A documentação interativa da API fica em: [http://localhost:3000/api](http://localhost:3000/api)

3. Em outro terminal, configure e inicie o aplicativo móvel (se necessário):
   
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

## Arquitetura e padrões de projeto

O repositório segue uma arquitetura cliente-servidor distribuída:

```mermaid
flowchart LR
  subgraph Frontend
    A[App Expo / React Native]
    P[Platform / React Three-Pane]
  end

  subgraph Backend
    API[NestJS API REST]
    DB[(PostgreSQL)]
  end

  A -->|HTTP / Bearer JWT| API
  P -->|HTTP / Bearer JWT| API
  API --> DB
```

### Plataforma Backoffice (`platform/`)

- **Three-Pane Application Layout**:
  - **Pane 1 (Navigation Rail - 64px)**: Barra vertical compacta com ícones, atalhos, controle de perfil, logout e controle de permissões por perfil (role-based).
  - **Pane 2 (Section Panel - 280px)**: Lista navegável com filtro de busca e badges para itens da seção selecionada.
  - **Pane 3 (Detail / Workspace Pane - flex-1)**: Painel principal para detalhamento, visualização profunda e formulários de criação/edição.
- **Controle de Acesso por Perfil (RBAC)**:
  - `coordinator`: Acesso completo (Dashboard, Agendamentos, Gestão de Usuários, Avaliações PHQ-9 e Diários).
  - `professor`: Avaliações PHQ-9, Diários dos pacientes e Agendamentos.
  - `lobby` (Recepcionista): Gestão e criação de agendamentos e listagem de usuários.
  - `trainee` (Estagiário): Visualização de seus agendamentos e notas.
  - `patient`: Acesso bloqueado na plataforma backoffice, redirecionando para o aplicativo móvel.

### Licença

Consulte os arquivos de licença de cada componente do projeto antes de redistribuí-lo.
