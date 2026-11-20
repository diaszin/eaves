# Bug Fix: Falha ao importar dinamicamente toXlsx.ts / toPdf.ts na exportação

- **Slug**: export-dynamic-import-fail
- **Fixed**: 2026-11-20
- **Assessment**: ./assessment.md
- **Status**: partial

## Summary

O terminal do Vite no container confirmou a causa: `Failed to resolve import "jspdf" from "src/shared/utils/export/toPdf.ts"`. A imagem/volume de `node_modules` do serviço `platform` foi criado antes de `exceljs`, `jspdf` e `jspdf-autotable` serem adicionados. A correção definitiva é reconstruir a imagem e renovar o volume (ação de ambiente, ainda pendente do usuário). No código foi aplicada a prevenção da hipótese secundária.

## Changes

| File | Change | Notes |
|------|--------|-------|
| `platform/vite.config.ts` | modified | `optimizeDeps.include` com `exceljs`, `jspdf`, `jspdf-autotable` |

## Tests Added or Updated

- Nenhum: o platform não tem framework de testes.

## Local Verification

- `yarn build` em `platform/` → passou.
- `vite` em dev (porta 5199) sobe sem erro com a nova configuração.
- Não foi possível validar a exportação dentro do container: depende da reconstrução da imagem.

## Deviations from Assessment

Nenhuma. A reconstrução da imagem não foi executada por derrubar/recriar os containers do usuário.

## Follow-ups

- **Pendente (correção principal)**, na raiz do repositório:
  `docker compose build --no-cache platform` e depois `docker compose up -d --renew-anon-volumes platform`.
  Sem `--renew-anon-volumes` o volume antigo de `/app/node_modules` é reaproveitado e o erro continua.
- Sempre que uma dependência for adicionada ao `platform/`, repetir esses comandos (o compose só monta `./platform/src`).
