# Research: Animação de sucesso

## Decisão 1: Biblioteca e versão
- **Decision**: `lottie-react-native` na versão que o Expo recomenda para o SDK 57 (`~7.3.8`), instalada com `npx expo install lottie-react-native` dentro de `app/`.
- **Rationale**: o `expo/bundledNativeModules.json` fixa essa versão; `expo install` garante compatibilidade. A constituição exige seguir as docs Expo da versão em uso (https://docs.expo.dev/versions/v57.0.0/sdk/lottie/).
- **Alternatives**: converter a animação em GIF/APNG (perde qualidade, mais pesado); `react-native-reanimated` manual (complexo, fora de YAGNI).
- **Impacto**: o app tem pasta `android/` (prebuild); após instalar é preciso novo build nativo (`expo run:android`/`prebuild`). Expo Go já inclui a biblioteca.

## Decisão 2: Fonte da animação
- **Decision**: `require("../../assets/animations/json/success.json")` passado em `source`.
- **Rationale**: arquivo local, empacotado pelo Metro (JSON é resolvido como módulo). O arquivo existe como `success.json` (minúsculo); usar exatamente essa grafia para funcionar em Linux/CI.
- **Alternatives**: URL remota (exige rede, falha offline).

## Decisão 3: Reprodução e reinício
- **Decision**: `autoPlay`, `loop={false}`; renderizar a animação somente enquanto `isOpen` é `true` (ou usar uma `key` que muda a cada abertura) para que ela recomece a cada abertura.
- **Rationale**: SC-003 exige reinício a cada reabertura; o conteúdo do BottomSheet pode permanecer montado entre aberturas, então `autoPlay` sozinho não basta. Se isso não bastar na prática, usar `ref.reset()` + `ref.play()` ao `isOpen` virar `true`.
- **Alternatives**: loop infinito (rejeitado: feedback de conclusão toca uma vez).

## Decisão 4: Tamanho e layout
- **Decision**: caixa quadrada de ~96–120px no lugar dos 64px do ícone, mantendo a altura do painel (200) sem corte; reduzir margens se necessário.
- **Rationale**: a composição tem 300x300 com margem interna, então pede caixa um pouco maior que o ícone para o mesmo peso visual. Validar visualmente.

## Decisão 5: Falha de carregamento (FR-008)
- **Decision**: mensagem e texto de apoio independentes da animação; falha da animação não exibe erro ao usuário.
- **Rationale**: o asset é local e empacotado, então a falha é improvável; tratamento mínimo basta.

## Decisão 6: Remoção do ícone
- **Decision**: remover o import `MdCheckCircle` (`react-icons/md`) do componente. `react-icons` permanece no projeto (usado em outros lugares).
- Observação: o componente tem `useColorScheme`/`ink` não usados e a prop com grafia `messsage`; fora do escopo, não alterar para não quebrar as 7 telas consumidoras.

Nenhum item `NEEDS CLARIFICATION` pendente.
