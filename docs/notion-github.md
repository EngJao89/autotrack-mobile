# Notion ↔ GitHub — Link Preview e convenções (AutoTrack)

Como manter o board Notion alinhado aos repositórios **sem** sync automático obrigatório.

| Repo | URL |
| --- | --- |
| Mobile | https://github.com/EngJao89/autotrack-mobile |
| API | https://github.com/EngJao89/autotrack-api |

> **Fonte da verdade:** Notion = especificação ATP; GitHub = código/PR.  
> **Concluído no Notion** só após aceite — não só porque o PR mergeou.

Para **consultar tasks via API, ler aceite e gerar/criar branch** no Mobile, use o tooling da ATP-34: [notion-task-workflow.md](./notion-task-workflow.md).

---

## O que basta na maioria dos casos

**Link Preview** (Notion → Settings → Connections → GitHub):

1. Conecte a conta GitHub com acesso aos repos.
2. No card ATP, cole a URL do PR.
3. Notion mostra prévia do PR.

Não exige Database sync nem Business plan para o fluxo básico.

---

## Convenções (board + git)

| Campo / artefato | Regra |
| --- | --- |
| **ID da Task** | Oficial no Notion (`ATP-XX`) — usar o mesmo na branch/commit/PR |
| **Branch** | `{tipo}/ATP-XX-slug` (ver README) |
| **Commit / PR title** | Conventional Commit + `[ATP-XX]` |
| **Repositório** | `autotrack-mobile` · `autotrack-api` · ou ambos (dois PRs) |

Template de PR: `.github/pull_request_template.md`.

---

## Database sync / Connected properties (opcional)

Disponível em planos Notion Business+: sync de PRs ou propriedade *GitHub Pull Requests*.  
Útil se o time quiser espelho automático; **não** é requisito da ATP-34 nem do Link Preview.

Detalhes: [Connect GitHub to Notion](https://www.notion.com/help/github), [Connected properties](https://www.notion.com/help/connected-properties).

---

## Status Notion ↔ GitHub

| Status Notion | GitHub típico |
| --- | --- |
| Backlog / Pronto | Sem branch ou só local |
| Em andamento / In progress | Branch / draft |
| Em revisão | PR aberto |
| Concluído | PR merged **e** aceite ok |
