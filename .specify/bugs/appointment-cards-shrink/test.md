# Bug Verification: Cards encolhem durante a animação de entrada

- **Slug**: appointment-cards-shrink
- **Tested**: 2026-11-20T22:28:43-03:00
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: partial

## Summary

A correção compilou e o projeto exportou a versão web, mas o síntoma original não foi exercitado visualmente nesta sessão. Portanto, não é possível afirmar que o encolhimento foi eliminado end-to-end; o resultado é parcial até a reprodução em `localhost:8081`.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Abrir `http://localhost:8081/` e observar os cartões durante a entrada | not-run | `localhost` é loopback; não acessado conforme a política de segurança da avaliação. |
| New / updated tests | Nenhum teste automatizado foi criado pelo fix | not-run | Não existe harness de componente configurado no `app/package.json`. |
| Regression suite | Nenhuma suite de testes adicional encontrada | not-run | Não há arquivos `*.test.*` ou `*.spec.*` em `app/`. |
| Type-check | `cd app && yarn tsc --noEmit` | pass | Nenhum erro TypeScript. |
| Web build | `cd app && yarn build:web` | pass | 63 rotas exportadas; a segunda execução teve apenas aviso de cache reciclado e terminou com sucesso. |
| Diff validation | `git diff --check -- app/src/templates/get-recently-appointments.tsx` | pass | Nenhum problema de whitespace. |
| Targeted lint | `cd app && yarn eslint src/templates/get-recently-appointments.tsx --no-cache` | fail | Falha preexistente em `Date.now()` em `get-recently-appointments.tsx:97`; nenhum diagnóstico novo da correção. |

## Output Excerpts

```text
yarn tsc --noEmit
Done in 9.08s.
```

```text
Exported: dist
Done in 39.78s.
```

```text
97:41 error react-hooks/purity: Cannot call impure function during render
Date.now is an impure function.
```

## Residual Risks

- A correção de largura não foi visualmente confirmada em web.
- Não foi confirmada compatibilidade Android/iOS.
- Não existe teste automatizado que impeça regressão no tamanho dos cartões.
- O lint direcionado continua bloqueado pelo cálculo preexistente de `Date.now()`.

## Recommendation

Manter o bug como **partial** até abrir a página em `localhost:8081`, entrar com vários agendamentos e confirmar visualmente que os cartões mantêm largura e altura durante toda a cascata e após a entrada. Se o encolhimento continuar, reiniciar a avaliação com evidência visual ou do DOM para localizar outra causa.
