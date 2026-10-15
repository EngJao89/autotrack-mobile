# ADR 0004 — Zustand para estado cliente compartilhado

- **Status:** Aceito
- **Data:** 2026-10-15
- **Escopo:** Mobile
- **Responsáveis / revisores:** time AutoTrack (registro via PR ATP-3)

## Contexto e problema

O mobile precisa de uma estratégia explícita para separar UI local, sessão Firebase, preferências, estado cliente compartilhado e dados remotos. Sem isso, há risco de duplicar sessão/perfil em vários mecanismos, contaminar sessão após logout e misturar cache HTTP com store global.

Já existem `AuthProvider` (Firebase) e `AppThemeProvider`. A ATP-3 pede inventário, matriz de alternativas, PoC testável (perfil autenticado) e políticas de limpeza/isolamento.

## Restrições relevantes

- Stack: Expo SDK 57, React Native, TypeScript, Expo Router, arquitetura feature-first (ATP-7).
- Tokens e senhas **não** podem ir para store persistido (ADR 0001).
- Persistência de negócio permanece na API (ADR 0002).
- Escopo ATP-3: não migrar a app inteira nem implementar CRUD completo.
- Preferência do time neste momento: começar com **Zustand**.

## Alternativas consideradas

1. **Somente React Context + estado local** — suficiente para auth/tema; fica verboso e pouco ergonômico para slices compartilhados com ações tipadas e testes isolados.
2. **Zustand** — store mínima tipada, sem boilerplate de actions/reducers, testável via `getState()`, encaixa ao lado do Context existente sem provider extra.
3. **Redux Toolkit** — excelente para apps grandes e RTK Query; custo de cerimônia e dependências alto para o estágio atual.
4. **TanStack Query (só)** — ideal para cache remoto; não substitui bem seleção local / UI compartilhada; pode coexistir depois.

## Decisão

**Estado atual (confirmado no mobile):**

- **Zustand** para estado cliente compartilhado da sessão: bootstrap de perfil (`idle`/`loading`/`ready`/`error`), snapshot `User`, `selectedVehicleId` (PoC) e limpeza no logout / troca de identidade.
- Store na feature: `src/features/auth/store/sessionStore.ts` (sem pasta global de estado).
- **AuthProvider** continua dono do ciclo Firebase e obtém tokens sob demanda.
- Falha de sync de perfil **não** revoga autenticação Firebase automaticamente.
- Respostas assíncronas stale são ignoradas (`profileRequestId`).
- Sem persistência do slice de perfil em AsyncStorage.

**Intenção futura (não fechada neste ADR):**

- Introduzir **TanStack Query** (ou equivalente) quando houver listas/recursos remotos além do bootstrap, com query keys incluindo identidade e parâmetros.
- Novos slices Zustand apenas com consumidor real e ownership na feature dona.

## Consequências

### Positivas

- Ownership claro: Firebase no Context; perfil compartilhado no Zustand.
- Isolamento de sessão testável (logout e troca de usuário).
- Baixo atrito para o estágio inicial do app.

### Custos, riscos e limitações

- Snapshot de perfil no Zustand **não** é cache HTTP completo (staleTime, refetch em foreground, retries).
- Risco de crescimento indevido do store se passar a espelhar todas as respostas da API — mitigado pela política documentada em `docs/state-management.md`.
- Registro da decisão não conclui integração, navegação ou funcionalidades de negócio.

## Plano de adoção / migração

1. Dependência `zustand` instalada via `expo install`.
2. PoC no bootstrap de perfil + `SessionHomeScreen` + testes de isolamento.
3. Documentação em `docs/state-management.md` e este ADR.
4. Próximos recursos remotos: avaliar Query antes de expandir o Zustand.

## Referências

- ATP-3 — Definir estratégia de gerenciamento de estado
- [docs/state-management.md](../state-management.md)
- [ADR 0001](./0001-firebase-identity-provider.md) — identidade Firebase
- [ADR 0002](./0002-persistence-owned-by-api.md) — persistência na API
- [docs/architecture.md](../architecture.md) — feature-first

## Histórico

| Data | Evento |
| --- | --- |
| 2026-10-15 | Registro inicial (Aceito com PoC ATP-3) |
