# ADR 0002 — Persistência de negócio na API (não no mobile)

- **Status:** Aceito
- **Data:** 2026-10-14
- **Escopo:** Transversal (decisão de persistência é da API; mobile apenas consome)
- **Responsáveis / revisores:** time AutoTrack (registro via PR ATP-4)

## Contexto e problema

O app mobile precisa de usuários, veículos e manutenções como dados de negócio. Surge a dúvida de onde persistir (SQLite no device, Firebase Firestore, ou somente API). A API AutoTrack já aponta para Prisma com evolução SQLite → PostgreSQL no backend.

## Restrições relevantes

- Mobile não deve armazenar senhas nem tokens de forma “de negócio”; sessão Firebase usa persistência do SDK (AsyncStorage) apenas para sessão Auth.
- Fonte de verdade do perfil local e recursos de domínio: **autotrack-api**.
- Detalhe de engine (SQLite inicial vs PostgreSQL) e migrações Prisma pertencem ao repositório da API.
- Esta ADR no mobile **não** redefine o roadmap de banco da API; apenas fixa o papel do cliente.

## Alternativas consideradas

1. **SQLite / armazenamento local como fonte de verdade no app** — offline-first forte, mas duplica modelo, sincronização e conflito com a API NestJS já prevista.
2. **Firestore / Realtime Database como banco de negócio** — mistura identidade Firebase com domínio; foge do desenho API REST + perfil local.
3. **API como única persistência de negócio (escolhida)** — mobile é cliente HTTP; API escolhe Prisma/SQLite/PostgreSQL.

## Decisão

**Estado atual (confirmado no mobile):**

- O app **não** persiste entidades de negócio (User de domínio, veículos, manutenções) em banco local próprio.
- Lê/escreve domínio via HTTP na `autotrack-api` (`src/services/api/client.ts` + operações na feature).
- Adapter **mock** de perfil existe só para desenvolvimento quando a API está indisponível (`EXPO_PUBLIC_API_MOCK`); não é persistência de produção.

**Sobre SQLite → PostgreSQL:**

- Evolução e migrações são responsabilidade da **API** (documentar detalhe técnico no `autotrack-api` ADR correspondente).
- Do ponto de vista mobile: irrelevante qual engine a API usa, desde que o contrato REST `/v1` se mantenha.

**Intenção futura:**

- Cache offline / sync no mobile permanece **backlog** (não aceito como decisão aqui).

## Consequências

### Positivas

- Um único lugar para schema, migrações e regras de integridade.
- Mobile mais simples; alinha feature-first com serviços de infra HTTP.
- Troca SQLite→PostgreSQL na API não exige mudança de storage no app.

### Custos, riscos e limitações

- App depende de rede/API para dados de domínio (exceto mock de bootstrap).
- Offline completo não está resolvido.
- Equipe precisa manter ADR de persistência atualizada no repo da API.

## Plano de adoção / migração

- Mobile: manter apenas cliente HTTP + mocks explícitos de desenvolvimento.
- API: registrar ADR própria sobre Prisma/SQLite/PostgreSQL sem apagar histórico de escolha inicial.
- Não implementar sync local nesta entrega.

## Referências

- `docs/architecture.md`, `docs/auth.md` (bootstrap / mock)
- `src/services/api/client.ts`, `src/features/auth/services/bootstrapProfile.ts`
- Tarefas: ATP-4; persistência detalhada na API (ATP relacionadas a Prisma/DB)
- Cruzado: `autotrack-api` ADR de PostgreSQL/Prisma / evolução SQLite (fonte de verdade técnica)

## Histórico

| Data | Evento |
| --- | --- |
| 2026-10-14 | Registro inicial (ATP-4) no mobile |
