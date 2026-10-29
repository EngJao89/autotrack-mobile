# Cliente HTTP (Axios) — AutoTrack Mobile

Documento da **ATP-40**. Centraliza o consumo da `autotrack-api` e a integração com o ambiente publicado no Render.

## Decisão

- Transporte: **Axios** (`src/services/api/client.ts`), instância compartilhada.
- Identidade: continua no **Firebase Auth**; a API recebe só `Authorization: Bearer <firebase-id-token>`.
- Domínio (perfil/veículos/manutenções): HTTP na API via módulos em `src/services/api/`.
- Estado/cache: **Zustand** (ATP-3) — Axios **não** substitui a camada de estado.

## Configuração

| Variável | Papel |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Base da API **sem** `/v1` (ex.: `https://autotrack-api-5r68.onrender.com`) |
| `EXPO_PUBLIC_API_TIMEOUT_MS` | Timeout Axios (default `30000`) |
| `EXPO_PUBLIC_API_MOCK` | Fallback explícito de perfil se a API falhar — **não** usar como sucesso silencioso |

Paths nos serviços já incluem o prefixo `/v1/…` (ex.: `/v1/health`, `/v1/vehicles`). Não coloque `/v1` no `baseURL`.

Ambiente publicado verificado: `GET /v1/health` e OpenAPI em `/api/docs-json`.

## Auth e sessão

1. Token obtido **no momento da request** (`getCurrentIdToken` ou `idToken` explícito).
2. Rotas públicas (`skipAuth: true`): ex. health.
3. **401**: no máximo **uma** renovação forçada do ID Token, coordenada entre requests concorrentes; sem loop.
4. Mutações **não** têm retry automático por timeout/rede (evita duplicar efeitos).
5. Logout / troca de conta chama `cancelPendingApiRequests()` e limpa o Zustand.

Falha HTTP **não** encerra a sessão Firebase automaticamente.

## Módulos

| Módulo | Responsabilidade |
| --- | --- |
| `client.ts` | Instância Axios, `apiRequest`, cancelamento, 401 refresh |
| `errors.ts` | `ApiError` + helpers |
| `health.ts` | `GET /v1/health` |
| `users.ts` | `GET /v1/users/me`, `PATCH /v1/users/:id` |
| `vehicles.ts` | CRUD `/v1/vehicles` |
| `maintenances.ts` | CRUD manutenções conforme OpenAPI |
| `features/auth/services/bootstrapProfile.ts` | `POST /v1/auth/bootstrap` (+ fallback `/users/me`) |

Telas **não** devem criar clientes Axios próprios.

## Erros

`ApiError`: `status`, `code`, `requestId`, `body`, `aborted`.  
Cancelamento esperado (`AbortSignal`) → `aborted: true` — UI não deve tratar como falha.

## Testes

- Unitários (sem rede): `src/services/api/errors.test.ts` (`ApiError`, abort helpers).
- Smoke manual: app autenticado → badge **API** no perfil + **Listar veículos (API)**; ou `curl https://autotrack-api-5r68.onrender.com/v1/health`.
- O cliente Axios depende de `env` (React Native); testes de interceptor ficam para harness Expo/Jest futuro.

## Limitações

- Tipos manuais alinhados ao OpenAPI até codegen (ATP-12).
- Cold start Render pode aproximar o timeout — ajuste `EXPO_PUBLIC_API_TIMEOUT_MS` se necessário.
- UI completa de veículos/manutenções permanece em ATPs próprias; aqui há só infra + smoke na home de sessão.
