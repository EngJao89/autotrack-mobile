# Architecture Decision Records (ADR) — autotrack-mobile

Registros leves de decisões de arquitetura deste repositório (Expo / React Native).

Numeração é **independente** por repositório. Referências cruzadas usam:

`autotrack-mobile ADR NNNN — título` ou `autotrack-api ADR NNNN — título`.

## Processo

1. **Propor** — copie [`template.md`](./template.md), preencha contexto, alternativas e decisão; status `Proposto`.
2. **Revisar** — abra PR; revisores validam evidência (código, docs, testes) e se o escopo está claro.
3. **Aceitar** — após merge/review, status `Aceito` e data de registro.
4. **Substituir** — nova ADR com status `Aceito`; a antiga fica `Substituído` com link para a nova. Não apague histórico.
5. **Correção editorial** — typos/links sem mudar a decisão: edite a ADR existente, sem novo número.

### Regras

- Uma decisão significativa por ADR.
- Distinguir **estado atual** de **intenção futura**.
- Não inventar justificativa retrospectiva; confirme com código/docs/PRs.
- Não incluir senhas, tokens, chaves privadas ou service accounts.
- Backlog de ADRs futuras fica **separado** das aceitas (abaixo).

## Índice — ADRs aceitas / registradas

| Nº | Título | Status | Escopo | Link |
| --- | --- | --- | --- | --- |
| 0001 | Firebase Authentication como provedor de identidade | Aceito | Transversal | [0001-firebase-identity-provider.md](./0001-firebase-identity-provider.md) |
| 0002 | Persistência de negócio na API (não no mobile) | Aceito | Transversal | [0002-persistence-owned-by-api.md](./0002-persistence-owned-by-api.md) |
| 0003 | Fronteira API/Mobile: REST `/v1` e contratos | Aceito | Transversal | [0003-api-mobile-boundary.md](./0003-api-mobile-boundary.md) |

## Decisões transversais (outros repositórios)

| Tema | Onde registrar detalhe de API | Espelho / impacto mobile |
| --- | --- | --- |
| Identidade Firebase + perfil local | `autotrack-api` (ADR correspondente, quando existir) | [0001](./0001-firebase-identity-provider.md) |
| PostgreSQL/Prisma e evolução SQLite | `autotrack-api` (fonte de verdade da persistência) | [0002](./0002-persistence-owned-by-api.md) |
| REST `/v1`, OpenAPI, responsabilidades | Ambos; contratos de integração no mobile em [0003](./0003-api-mobile-boundary.md) | — |

## Backlog (ainda não aceitos como decisão fechada)

Estes temas existem no produto, mas **não** estão registrados como ADR `Aceito` nesta entrega:

- Estratégia definitiva de state management no mobile
- Navegação definitiva (além do Expo Router atual)
- Geração de cliente TypeScript a partir de OpenAPI
- ADR formal de feature-first (hoje coberto por [`../architecture.md`](../architecture.md); promover a ADR quando estabilizar)

## Documentação relacionada (não-ADR)

| Doc | Papel |
| --- | --- |
| [`../architecture.md`](../architecture.md) | Guia feature-first e limites de módulo (ATP-7) |
| [`../auth.md`](../auth.md) | Como configurar e usar auth no app (ATP-31/32) |
| [`../design-system.md`](../design-system.md) | Tokens e primitivos UI (ATP-8) |
