# Quickstart: validar a exportação

## Pré-requisitos
- API e banco rodando (Docker Compose) com dados de demo (`server/scripts/seed-demo.mjs`).
- `cd platform && yarn install && yarn dev`; entrar como coordenador ou professor.

## Escala
1. Abrir **Escalas** e selecionar uma escala com turnos.
2. "Exportar Excel" → "Esta escala". Conferir no .xlsx: estagiário, período, status e uma linha por turno, de domingo a sábado e depois as datas específicas.
3. Repetir com PDF; conferir acentos e paginação.
4. Escolher "Todas as escalas ativas" para um estagiário com 2 ou mais escalas: a coluna Escala vem preenchida.
5. Escala sem turnos: mensagem "Não há horários para exportar." e nenhum download.

## Pesquisa
1. Abrir **Pesquisas** e selecionar uma resposta.
2. Exportar Excel e PDF; conferir as 9 perguntas, pontuações, rótulos, total (x/27) e gravidade iguais aos da tela.
3. Resposta com pergunta sem pontuação: aparece "Sem resposta" e o total é igual ao da tela.

## Papéis
- Entrar com um papel de menor acesso (estagiário ou recepção): os botões aparecem só onde a tela já é acessível (FR-011).

## Verificações automáticas
- `cd platform && yarn build && yarn lint` sem erros.
