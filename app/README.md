# Aplicativo Eaves

Aplicativo mobile e web do Eaves, desenvolvido com React Native, Expo e TypeScript. O projeto usa Expo Router para navegação por arquivos e NativeWind para estilos utilitários.

## Requisitos

- Node.js e npm.
- Expo Go para testes em dispositivo compatível, ou Android Studio para executar em um emulador Android.
- A API Eaves configurada e acessível para os fluxos que dependem do servidor.

## Configuração

Na pasta `app/`, instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na pasta `app/` e configure a URL base da API:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Em um celular físico, `localhost` aponta para o próprio aparelho. Use o IP local do computador que está executando a API, por exemplo `http://192.168.1.20:3000`, e mantenha os dois dispositivos na mesma rede.

## Executar

```bash
npx expo start
```

No terminal do Expo, escolha o destino desejado. Também estão disponíveis estes atalhos:

```bash
npm run android
npm run ios
npm run web
```

Os comandos `android` e `ios` executam builds nativos locais e exigem as ferramentas de desenvolvimento correspondentes. Para verificar o projeto com o lint configurado:

```bash
npm run lint
```

## Organização do código

- `src/app/`: rotas e layouts do Expo Router.
- `src/features/`: módulos organizados por funcionalidade, incluindo autenticação.
- `src/components/`: componentes compartilhados da interface.
- `src/hooks/`: hooks compartilhados, incluindo acesso à sessão e autenticação.
- `src/shared/`: infraestrutura compartilhada, como o cliente HTTP.
- `src/constants/`: constantes globais.

Para iniciar o restante do ambiente e configurar a API, consulte o [README principal](../README.md) e o [guia do servidor](../server/README.md).

## Documentação

- [Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/docs/getting-started)
