# Data Model: Animação de sucesso no botão de login

Nenhuma entidade persistida e nenhuma mudança de API. Apenas estado de UI na tela de login.

## Estado de UI: `successButton`

| Valor | Significado |
|-------|-------------|
| `null` | Fluxo normal; nenhum login aceito aguardando animação |
| `"email"` | Login por e-mail/senha aceito; animação tocando no botão "Entrar" |
| `"microsoft"` | Login Microsoft aceito (conta existente); animação tocando no botão da Microsoft |

### Transições

```text
null --(mutation e-mail onSuccess, após signIn)--> "email"
null --(mutation Microsoft onSuccess com data, após signIn)--> "microsoft"
"email" | "microsoft" --(onFinish: fim da animação ou tempo limite)--> router.replace("/")
```

- Não há retorno a `null`: depois de `onFinish` a tela é substituída.
- Cadastro Microsoft incompleto (`data` indefinido) e erros mantêm `null`.

## Regras derivadas

- Botões desabilitados quando `successButton !== null`.
- `onFinish` dispara no máximo uma vez (guarda no componente da animação).
- Constantes: tempo limite 3500 ms; caixa da animação 40x40; verde `#00C885`.
