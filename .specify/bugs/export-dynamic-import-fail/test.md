# Bug Verification: Falha ao importar dinamicamente toXlsx.ts / toPdf.ts na exportação

- **Slug**: export-dynamic-import-fail
- **Tested**: 2026-11-20
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: partial

## Summary

Após a reconstrução do container, o dev server serve `toXlsx.ts` e `toPdf.ts` sem erro e as três bibliotecas resolvem. A causa original (dependências ausentes no container) não ocorre mais. O clique real em "Exportar" no navegador e a abertura dos arquivos não foram exercitados, por isso o resultado é `partial`.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Container com dependências | `docker exec eaves-platform ls node_modules` | pass | `exceljs`, `jspdf`, `jspdf-autotable` presentes |
| Config nova no container | `docker exec eaves-platform grep optimizeDeps vite.config.ts` | pass | 1 ocorrência |
| Módulos de exportação servidos | `curl http://localhost:5173/src/shared/utils/export/toXlsx.ts` e `toPdf.ts` | pass | HTTP 200 nos dois (antes: erro 500 de resolução) |
| Imports pré-otimizados | `curl .../node_modules/.vite/deps/{exceljs,jspdf,jspdf-autotable}.js` | pass | HTTP 200 nos três |
| Log do Vite | `docker logs eaves-platform` | pass | sem "Failed to resolve import" |
| Reprodução no navegador (clicar em Exportar Excel/PDF e abrir o arquivo) | manual | not-run | requer navegador/interação do usuário |
| Build | `yarn build` em `platform/` (executado no fix) | pass | sem erros |
| Testes automatizados / lint | n/a | not-run | o platform não tem framework de testes nem `eslint` instalado |

## Output Excerpts

```
toXlsx 200
toPdf 200
import("/node_modules/.vite/deps/jspdf.js?v=e09663c1")
import("/node_modules/.vite/deps/jspdf-autotable.js?v=e09663c1")
```

## Residual Risks

- Não confirmado no navegador: download efetivo, acentos no .xlsx/PDF e paginação (continua a T013 do quickstart da feature 003).
- Qualquer nova dependência exige reconstruir a imagem com `--renew-anon-volumes`, pois o compose monta só `./platform/src`.

## Recommendation

Hold: causa corrigida e verificada no nível do servidor. Falta apenas um clique de confirmação no navegador (Exportar Excel e Exportar PDF em uma escala e em uma pesquisa). Se funcionar, fechar o bug; se falhar, rodar `/speckit-bug-assess` com a mensagem do console.
