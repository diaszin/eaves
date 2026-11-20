# Contrato de UI: Transições

Módulo: `app/src/shared/navigation/transitions.ts`

## Interface

- `useScreenTransition()`: retorna `{ animation: "fade" | "none", animationDuration: number }` para `screenOptions` de pilhas.
- `useTabTransition()`: retorna `{ animation: "fade" | "none" }` para `screenOptions` das abas.
- `useProfessionalSharedTag(id: number): string | undefined`: hook que devolve `professional-card-{id}`, ou `undefined` quando "reduzir movimento" está ativo.

## Mapa de navegações

| Navegação | Transição |
|-----------|-----------|
| Lista de profissionais → Agendar consulta (e volta) | Hero (card) sobre base fade |
| Abas do início (Início, Meu diário, Procurar consultas) | Fade (abas) |
| Início → Perfil → Alterar dados / Alterar senha | Fade |
| Diário → Novo registro / Detalhe | Fade |
| Início → Questionário PHQ | Fade |
| Login ↔ Cadastro / Esqueci a senha / Redefinir | Fade |
| Qualquer tela → Termos legais | Fade |
| Redirecionamentos de sessão (login ↔ área autenticada) | Fade |

## Regras

- Nenhuma tela define `animation` por conta própria, exceto para sobrescrever com `none` em "reduzir movimento".
- A tag do Hero é a mesma nas duas telas e específica por profissional (FR-003).
- A flag `ENABLE_SHARED_ELEMENT_TRANSITIONS` deve estar `true` em `package.json` (`reanimated.staticFeatureFlags`).
