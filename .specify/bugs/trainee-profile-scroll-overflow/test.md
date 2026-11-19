# Bug Verification: Rolagem vertical/horizontal no perfil do estagiário

- **Slug**: trainee-profile-scroll-overflow
- **Tested**: 2026-11-19
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: partial

## Summary

Type-check e build de produção passam com a correção, mas a reprodução do bug (comportamento visual de rolagem em `/trainees/:id`) não foi exercida: não há navegador/teste de layout disponível nesta sessão. Não é possível afirmar que o sintoma foi resolvido.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Abrir `/trainees/:id` como coordenador e inspecionar rolagem | not-run | Exige app + backend + navegador; bug nunca foi reproduzido antes do fix |
| New / updated tests | — | not-run | Nenhum teste adicionado; `platform` não tem framework de testes |
| Regression suite | — | not-run | Sem script `test` em `platform/package.json` |
| Type-check | `npx tsc --noEmit` (platform) | pass | Sem erros |
| Build | `npx vite build` (platform) | pass | Build concluído; apenas aviso de tamanho de chunk (pré-existente) |
| Lint | `npx eslint src/shared/components/layout src/features/users` | not-run | ESLint 9 sem `eslint.config.*` (só configuração legada) — falha de configuração, não do código |

## Output Excerpts

```
✓ built in 16.21s
```

## Residual Risks

- O sintoma original não foi observado nem antes nem depois; a causa raiz era hipótese de confiança baixa-média.
- `ThreePaneLayout` é compartilhado: regressões visuais em outras telas não foram verificadas.
- Itens `[NEEDS CLARIFICATION]` da assessment (navegador, viewport, tipo exato de rolagem) continuam em aberto.

## Recommendation

Hold — verificar manualmente no navegador (`yarn dev`, coordenador, `/trainees/:id`, 1280/1024/768 px, estados loading/vazio/com dados) e conferir no DevTools que `document.documentElement.scrollWidth <= clientWidth` e que há uma única barra vertical. Se o sintoma persistir, reabrir com `/speckit-bug-assess` incluindo o elemento com `scrollWidth > clientWidth`.
