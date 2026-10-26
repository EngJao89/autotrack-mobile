# Workflow Notion → task → branch (autotrack-mobile)

Documentação da **ATP-34**: consolidar no Mobile a consulta de tasks do board Notion, leitura de detalhes/critérios de aceite e geração (ou criação local) de branch Git.

> Escopo **Mobile only**. Replicar no `autotrack-api` fica para atividade própria e **não** bloqueia o aceite desta ATP.  
> Isto **não** é sincronização bidirecional Notion↔GitHub, nem parte do app Expo em runtime.

## Mecanismo (localização)

| Caminho | Papel |
| --- | --- |
| `scripts/notion/cli.mjs` | CLI: `list`, `show`, `suggest-branch`, `create-branch` |
| `scripts/notion/client.mjs` | Notion REST (query database + blocks) — **somente leitura** |
| `scripts/notion/mapProperties.mjs` | Mapeamento defensivo de propriedades |
| `scripts/notion/branchName.mjs` | Prefixo por Tipo + `ATP-ID` + slug do título |
| `scripts/notion/gitBranch.mjs` | Sugestão vs criação local de branch |
| `scripts/notion/*.test.mjs` | Testes de mapeamento e nome de branch |
| `examples/notion/sanitized-task-show.json` | Exemplo sanitizado de `show` |
| `docs/notion-github.md` | Link Preview / convenções de board (sem API) |

**Não** há `NOTION_*` em `src/` nem variáveis `EXPO_PUBLIC_NOTION_*`. Credenciais ficam só no `.env` local do desenvolvedor / CI secreto.

## Mapeamento do board

Propriedades padrão (sobrescrevíveis por env):

| Env | Default no board Mobile |
| --- | --- |
| `NOTION_PROP_TASK_ID` | `ID da Task` (Unique ID `ATP-*`) |
| `NOTION_PROP_STATUS` | `Status` |
| `NOTION_PROP_TYPE` | `Tipo` |
| `NOTION_PROP_PRIORITY` | `Prioridade` |
| `NOTION_PROP_ESTIMATE` | `Estimativa` |
| `NOTION_PROP_TAGS` | `Requisito` |

Campos ausentes entram em `missingProperties` — o CLI **não inventa** valores.

### Limitações de acesso

- Token de integração Notion precisa de acesso ao database do board.
- Sem token / sem permissão → erro claro (`MISSING_NOTION_TOKEN`, `NOTION_ACCESS_DENIED`).
- Task inexistente → `TASK_NOT_FOUND`.
- Link Preview no Notion (Connections) é independente desta CLI.

## Suggest vs create (diferenciados)

| Comando | Efeito |
| --- | --- |
| `npm run notion:suggest-branch -- ATP-34` | **Só imprime** o nome. Não altera git nem Notion. |
| `npm run notion:create-branch -- ATP-34` | Cria branch **local** a partir de `NOTION_BASE_BRANCH` (default `master`). Não faz push, merge, PR nem muda status no Notion. |

Regras de criação:

- Confere se `origin` contém `autotrack-mobile` (`NOTION_EXPECTED_REPO`).
- Recusa se a branch já existir (`BRANCH_EXISTS`) — **não sobrescreve**.
- Prefixo vem do `Tipo` da task, ou `--prefix chore` para forçar (ex.: card Feature com branch chore sugerida).

Formato: `{prefix}/{ATP-ID}-{slug}`  
Ex.: `chore/ATP-34-notion-task-workflow`

## Configuração

1. Crie uma [integração Notion](https://www.notion.so/my-integrations) (secret interno).
2. Compartilhe o database do board com a integração.
3. No `.env` local (nunca commitado):

```bash
NOTION_TOKEN=secret_ou_ntn_…
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# opcionais:
# NOTION_BASE_BRANCH=master
# NOTION_EXPECTED_REPO=autotrack-mobile
```

Nomes documentados em `.env.example` — **sem** valores secretos.

## Roteiro de uso

```bash
# Listar tasks (somente leitura)
npm run notion:list

# Detalhes + critérios de aceite
npm run notion:show -- ATP-34

# Sugerir nome de branch (sem git)
npm run notion:suggest-branch -- ATP-34
npm run notion:suggest-branch -- ATP-34 --prefix chore

# Criar branch local (sem push / sem escrever no Notion)
npm run notion:create-branch -- ATP-34 --prefix chore
```

## Testes

```bash
npm test
```

Inclui `scripts/notion/*.test.mjs` (slug, ID, mapeamento, suggest).  
Fluxo conectado (com token local): `notion:list` / `notion:show` — evidência sanitizada em `examples/notion/sanitized-task-show.json`.

## Fora de escopo (ATP-34)

- Sync bidirecional Notion↔GitHub, webhooks, fechar card no merge
- Criar propriedades/views no board automaticamente
- Alterar cards, PRs ou branches remotas sem autorização explícita
- Integração equivalente no `autotrack-api` (evolução futura)

## Relação com ATP-3

O PR da estratégia Zustand (**ATP-3**) **não** conta como evidência desta tarefa. Branch/commit/PR da ATP-34 são próprios (`chore/ATP-34-notion-task-workflow`).
