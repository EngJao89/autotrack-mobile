# Estratégia de gerenciamento de estado — AutoTrack Mobile

Documento da **ATP-3**. Define ownership, políticas e limites do estado no app Expo / React Native / TypeScript.

> Decisão formal: [ADR 0004](./adr/0004-zustand-client-state.md).  
> Esta decisão **não** fecha sozinha navegação definitiva, CRUD de domínio ou integração completa com a API.

## Inventário (fonte de verdade)

| Estado | Produtor | Consumidores | Fonte de verdade | Onde vive |
| --- | --- | --- | --- | --- |
| Ciclo Firebase (`loading` / autenticado / não autenticado) | `AuthProvider` + `onAuthStateChanged` | `AuthGate`, telas de login | Firebase Auth | Context (`useAuth().status`) |
| Identidade Firebase (`firebaseUser`) | `AuthProvider` | Bootstrap, token, UI de sessão | Firebase Auth | Context |
| ID Token | `getIdToken` sob demanda | HTTP client / bootstrap | Firebase | **Não** entra em store persistido |
| Bootstrap de perfil (idle/loading/ready/error) | `AuthProvider` → `sessionStore` | `SessionHomeScreen`, futuros consumidores | API (ou mock explícito) | Zustand `useSessionStore` |
| Snapshot de perfil (`User`) | Bootstrap / refresh | Home de sessão | API local | Zustand (memória) |
| Erros de formulário auth | `signIn` / `register` | Login / Register | Ação local | Context `error` |
| Tema light/dark | `AppThemeProvider` | UI | Preferência de apresentação | Context de tema |
| UI local (modais, expansão) | Componente | Componente | Interação | `useState` / `useReducer` |
| Campos de formulário | Feature/tela | Feature/tela | Input do usuário | react-hook-form (não no Zustand) |
| Veículo selecionado (PoC) | Ação do usuário | Home de sessão | Escolha local | Zustand — limpo no logout |
| Cache remoto genérico | — | — | — | **Adiado** (TanStack Query quando houver listas reais) |

## Classificação e responsabilidades

| Categoria | Regra |
| --- | --- |
| **UI local** | Modal, expansão, seleção temporária → `useState`/`useReducer` perto do componente. Só compartilhar se houver consumidor real. |
| **Formulários** | Valores, validação e submit na feature/tela. Não colocar cada campo em store global. |
| **Sessão Firebase** | `AuthProvider` mantém o ciclo e a identidade. **Proibido** persistir senha ou token em store. |
| **Tema / preferências** | Manter `AppThemeProvider`. Preferências sensíveis não persistem sem política. |
| **Estado cliente compartilhado** | **Zustand** (ATP-3), store por feature (`features/auth/store`), sem pasta global “dump”. |
| **Dados remotos** | PoC atual: snapshot de perfil no Zustand com status explícito. Cache/lista: avaliar **TanStack Query** na próxima necessidade real — não copiar respostas HTTP indiscriminadamente para stores. |

## Matriz de decisão (resumo)

| Necessidade | Context | Zustand | Redux Toolkit | TanStack Query |
| --- | --- | --- | --- | --- |
| Auth Firebase + poucos métodos | Adequado (já existe) | Complementar | Overkill | Não |
| Slice compartilhado tipado (perfil, seleção) | Verboso | **Escolhido** | Possível, mais boilerplate | Não |
| Cache HTTP, stale/refetch, invalidação | Não | Limitado | RTK Query | **Preferido depois** |
| Expo / RN / TS | Nativo | Leve, sem provider extra | Mais deps | Maduro no ecossistema |
| Testabilidade | Média | Alta (`getState`) | Alta | Alta |
| Impacto na arquitetura feature-first | Baixo | Baixo (store na feature) | Médio | Médio (provider root) |

**Escolha atual:** manter Context para Firebase + tema; adotar **Zustand** para estado cliente compartilhado da sessão (perfil bootstrap + limpeza). Separar escolha de **cache remoto** (TanStack Query) para quando houver recursos além do bootstrap.

## Ciclo de sessão e perfil

1. Firebase emite usuário → `status = authenticated` (independente do perfil).
2. `beginProfileLoad(uid)` → `profileStatus = loading`.
3. Sucesso → `ready` + snapshot; falha → `error` + mensagem.
4. **Política:** falha de sync de perfil **não** desloga o Firebase automaticamente.
5. Logout ou troca de `uid` → `clearSessionClientState()` (perfil, erro, veículo selecionado, identityKey).
6. Respostas assíncronas antigas são descartadas via `profileRequestId`.
7. Tokens só via `getAccessToken` / `getIdToken` — nunca no Zustand.

## Políticas de dados remotos (PoC + intenção)

| Tema | Política PoC | Intenção futura |
| --- | --- | --- |
| Chaves | Identidade = `firebaseUid` | Incluir `vehicleId` / filtros em query keys |
| Stale / refetch | Refresh manual (`refreshProfile`) | `staleTime` por recurso via TanStack Query |
| Invalidação | `invalidateProfile` antes de reload | Após create/update/delete do recurso |
| Updates | Pessimista | Otimista só com rollback documentado |
| Estados | idle / loading / ready / error (+ empty depois) | Separar loading inicial vs background |
| Retries | Nenhum automático no PoC | Limitados; sem retry cego em 401/403/validação |
| Persistência de cache | **Não** persiste perfil privado | Exceção exige propósito + limpeza no logout |
| Foreground / rede | Não tratado no PoC | Avaliar com Query + AppState |

**Mock vs real:** `EXPO_PUBLIC_API_MOCK=true` ativa adapter local em `bootstrapProfile.ts`. Badge “Mock API” na UI. Mock ≠ integração de produção.

## Organização e limites

- Hooks/selectors/ações de domínio ficam **na feature** (`features/auth/store`).
- Providers compartilhados: composição em `src/app/_layout.tsx`.
- Design System **não** importa stores de negócio.
- Infra (`src/services`) **não** importa features.
- Sem diretório global único de “todo o estado da app”.

## PoC entregue

- Feature: leitura do perfil autenticado (bootstrap).
- Valida: loading, success, error, invalidate/refresh, limpeza no logout, isolamento entre identidades.
- Testes: `src/features/auth/store/sessionStore.test.ts`.
- Código: `sessionStore.ts` + integração em `AuthProvider` / `SessionHomeScreen`.

## Fora de escopo (ATP-3)

CRUD completo, recriar Auth/Theme/navegação, offline-first, filas, OpenAPI client, migrar a app inteira para Zustand.
