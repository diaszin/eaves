# Bug Fix: Cards encolhem durante a animação de entrada

- **Slug**: appointment-cards-shrink
- **Fixed**: 2026-11-20T22:22:34-03:00
- **Assessment**: ./assessment.md
- **Status**: partial

## Summary

Aplicada uma correção mínima no contêiner externo dos cartões animados: os estados animado e pendente agora ocupam 100% da largura, permanecem estendidos no eixo principal e não permitem `flexShrink`. A alteração preserva `FadeInDown` e não muda dados, ações ou a cascata.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `app/src/templates/get-recently-appointments.tsx` | Modified | Adicionadas restrições `width`, `alignSelf` e `flexShrink` aos contêineres do cartão animado e pendente. |

## Diff Highlights (optional)

```tsx
<Animated.View
  entering={entering}
  style={{ width: "100%", alignSelf: "stretch", flexShrink: 0 }}
>
  {card}
</Animated.View>
```

```tsx
const pendingStyle = {
  width: "100%" as const,
  alignSelf: "stretch" as const,
  flexShrink: 0,
  ...
};
```

## Tests Added or Updated

- Nenhum teste automatizado foi adicionado; o projeto não possui harness de componente para este template. A verificação visual web descrita na avaliação continua pendente.

## Local Verification

- Commands run: `yarn tsc --noEmit` → passou.
- Commands run: `yarn build:web` → passou; 63 rotas exportadas.
- Commands run: `yarn eslint src/templates/get-recently-appointments.tsx --no-cache` → falhou somente pelo diagnóstico preexistente de `Date.now()` em `app/src/templates/get-recently-appointments.tsx:97`; nenhum diagnóstico novo da correção foi reportado.
- Manual checks: não realizado nesta sessão. A reprodução em `localhost:8081` continua necessária para confirmar que o encolhimento desapareceu.

## Deviations from Assessment

- A correção não removeu o contêiner externo nem alterou o `ScrollView`/`FlatList`, porque não havia reprodução suficiente para justificar uma mudança estrutural maior.
- Foi aplicada uma preservação explícita de largura/layout no contêiner externo, conforme a alternativa de layout menos invasiva.

## Follow-ups

- Executar `/speckit-bug-test slug=appointment-cards-shrink` após validar visualmente em web.
- Verificar dimensões dos cartões antes, durante e depois da animação para confirmar que não há alteração progressiva.
