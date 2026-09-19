# Eaves

Nosso projeto busca incentivar o cuidado com a saúde mental dos universitários, oferecendo um aplicativo que apoia o equilíbrio emocional diante das demandas acadêmicas e pessoais. A ferramenta permite acompanhar a rotina, identificar sinais de sobrecarga e definir metas voltadas ao bem-estar, fornecendo dados que ajudam na construção de hábitos mais saudáveis e na melhoria da qualidade de vida.

## 🚀 Stacks

#### 🌐Frontend

* React Native

* Expo

* TypeScript

## 🏫Padrão de Projeto

#### 🌐Frontend - Feature-Driven / Modular

Em vez de separar tudo por tipo técnico (`components/`, `screens/`, `hooks/`), o recomendado para projetos escaláveis é agrupar por domínio ou funcionalidade (`features/`).

- **`app/`**: Foco exclusivo em rotas e layouts de navegação (Expo Router).

- **`src/` ou na raiz:**
  
  - **`components/`**: Componentes globais e reutilizáveis de UI (botões, inputs, cards).
  - **`features/`**: Módulos independentes (ex: `auth/`, `profile/`, `feed/`). Cada feature contém seus próprios componentes locais, hooks, serviços e tipos específicos.
  - **`services/`**: Configuração de clientes HTTP (Axios, Fetch) e chamadas de API globais.
  - **`store/` ou `hooks/`**: Gerenciamento de estado global e hooks customizados compartilhados.
  - **`constants/`**: Cores, temas, funções utilitárias e constantes globais.