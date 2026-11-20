# Bug Assessment: Falha ao importar dinamicamente toXlsx.ts / toPdf.ts na exportação

- **Slug**: export-dynamic-import-fail
- **Created**: 2026-11-20
- **Source**: pasted text
- **Verdict**: likely valid, needs reproduction
- **Severity**: high

## Report (verbatim or summarized)

> Failed to fetch dynamically imported module: http://localhost:5173/src/shared/utils/export/toXlsx.ts. Esse bug tbm acontece para a exportação em PDF: Failed to fetch dynamically imported module: http://localhost:5173/src/shared/utils/export/toPdf.ts

## Symptom

Ao clicar em "Exportar Excel" ou "Exportar PDF" (escala ou pesquisa) no servidor de desenvolvimento (porta 5173), o import dinâmico de `toXlsx.ts` / `toPdf.ts` falha e nenhum arquivo é baixado. O esperado era o download do arquivo.

## Reproduction

1. Subir o painel em dev em `http://localhost:5173` (provavelmente via `docker compose up`, serviço `platform`).
2. Abrir uma escala ou uma pesquisa e clicar em "Exportar Excel" ou "Exportar PDF".
3. Console do navegador: "Failed to fetch dynamically imported module".

[NEEDS CLARIFICATION: o painel roda via Docker Compose ou `yarn dev` local? O console/terminal do Vite mostra "Failed to resolve import "exceljs"" ou "504 Outdated Optimize Dep"?]

## Suspected Code Paths

- `docker-compose.yml:37-39` — o serviço `platform` monta apenas `./platform/src` e usa o volume anônimo `/app/node_modules`; `package.json` e `node_modules` ficam como foram no build da imagem.
- `platform/Dockerfile.dev:5-7` — `npm install` roda só no build da imagem. As dependências `exceljs`, `jspdf` e `jspdf-autotable` (adicionadas em `platform/package.json` no commit 0343252) não existem nessa imagem/volume se ela não foi reconstruída.
- `platform/src/shared/utils/export/toXlsx.ts:6` e `toPdf.ts:4-5` — são os módulos que importam as libs; a falha de resolução aqui derruba o import de todo o módulo, e o navegador só vê "Failed to fetch dynamically imported module".
- `platform/src/shared/utils/export/download.ts:34-37` — origem do `import('./toXlsx')` / `import('./toPdf')`.

## Root Cause Hypothesis

Hipótese principal (confiança média-alta): o container de dev não tem as novas dependências. O Vite serve `toXlsx.ts`/`toPdf.ts`, mas ao transformar o arquivo não resolve `exceljs`/`jspdf`, devolve erro 500 e o import dinâmico rejeita. O erro aparecer exatamente para os dois arquivos e não para a página (que não importa as libs de forma estática) reforça isso. Em ambiente local o `yarn build` passou, e `exceljs` e `jspdf` existem em `platform/node_modules`, então o código em si compila.

Hipótese secundária (confiança baixa): em `yarn dev` local, o Vite só descobre `exceljs` (CommonJS) no primeiro clique, reotimiza as dependências e invalida o módulo ("Outdated Optimize Dep"), o que gera o mesmo erro até recarregar a página.

## Proposed Remediation

**Preferred**: reconstruir a imagem e renovar o volume de `node_modules` (`docker compose build --no-cache platform` e `docker compose up -d --renew-anon-volumes platform`), para instalar as novas dependências. Isso é ambiente, não código.

**Alternatives** (para evitar a hipótese secundária e tornar o dev robusto):
- Adicionar `optimizeDeps: { include: ['exceljs', 'jspdf', 'jspdf-autotable'] }` em `platform/vite.config.ts`, para o Vite pré-empacotar as libs na subida e não no primeiro clique. Custo: pequeno aumento no tempo de start.

**Files likely to change**:
- `platform/vite.config.ts` (somente se a hipótese secundária se confirmar ou como prevenção)

**Tests to add or update**:
- Não há framework de testes no platform. Validar manualmente: exportar Excel e PDF de uma escala e de uma pesquisa em dev, após reconstruir o container.

## Risks & Considerations

- `optimizeDeps.include` pode aumentar o tempo de start do dev server; sem impacto no build de produção.
- O `Dockerfile` de produção (`platform/Dockerfile`) usa build próprio e não deve ser afetado; conferir que instala dependências a partir do `package.json`/`yarn.lock` atualizados.
- Documentar que, ao adicionar dependências, é preciso reconstruir a imagem do `platform` por causa do volume anônimo de `node_modules`.

## Open Questions

- [NEEDS CLARIFICATION: como o painel está rodando (Docker ou local)?]
- [NEEDS CLARIFICATION: qual é a mensagem completa no terminal do Vite no momento do clique?]
