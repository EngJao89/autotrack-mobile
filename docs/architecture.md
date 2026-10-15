# Arquitetura feature-first — AutoTrack Mobile

Documento da ATP-7. Define limites de módulo, direção de dependências e o exemplo concreto **auth**.

## Inventário (estado atual)

| Área | Caminho | Responsabilidade |
| --- | --- | --- |
| Rotas | `src/app/` | Expo Router: layouts, params, composição de providers e telas |
| Auth (feature) | `src/features/auth/` | Sessão Firebase, login/registro, bootstrap de perfil (Zustand), guard de rota |
| Design System | `src/components/ui/` | Primitivos tipados (Button, Text, Screen, …) |
| Tema | `src/theme/` | Tokens + `AppThemeProvider` |
| Config | `src/config/` | Leitura/validação de `EXPO_PUBLIC_*` |
| Infra | `src/services/` | Firebase app/auth init + transporte HTTP (`api/client`) |
| Template legado | `src/constants/`, `src/hooks/`, componentes themed | Starter Expo; não é domínio |
| Tipos CSS | `src/types/css.d.ts` | Declarações de módulo CSS |

Diferenças vs README antigo: `User` saiu de `src/types/` para `features/auth/types/` (ainda exportado pela API pública de auth); operações de sessão/bootstrap saíram de `src/services` para a feature.

## Princípio feature-first

- **Features** agrupam telas, hooks, tipos e operações de um domínio.
- **Rotas** (`src/app`) só delegam — sem Firebase, HTTP ou regra de negócio.
- **Infra compartilhada** (`src/services`, `src/config`) não importa features nem rotas.
- **Design System / theme** não importam features nem rotas.
- Features **não** importam `src/app`.
- Entre features, só via **API pública** (`features/<nome>/index.ts`).
- Dentro da feature, preferir **imports relativos** (evitar ciclo via barrel).

```text
src/app  →  features/*, theme, components/ui
features →  services, config, theme, components/ui  (não → app)
services →  config                                  (não → features/app)
theme / components/ui → (não → features/app)
```

## Organização de pastas

```text
src/
├── app/                      # Rotas finas
├── features/
│   └── auth/                 # Exemplo de referência
│       ├── screens/
│       ├── hooks/
│       ├── services/         # Operações de domínio (usam infra)
│       ├── store/            # Zustand (estado cliente da feature)
│       ├── types/
│       ├── AuthProvider.tsx
│       ├── AuthGate.tsx
│       └── index.ts          # API pública
├── components/ui/            # Design System
├── theme/
├── services/                 # Infra: firebase.ts, api/client.ts
├── config/
├── hooks/                    # Hooks genéricos reutilizados
└── types/                    # Só tipos realmente compartilhados (ex.: css.d.ts)
```

Subpastas só com código real. **Não** criar pastas vazias para perfil/veículos/manutenções nesta tarefa.

## Módulo de referência: Auth

### Limite

- Sessão Firebase (e-mail/senha, Google via AuthSession)
- Estado de autenticação (`AuthProvider` / `useAuth`) — ciclo Firebase no Context
- Bootstrap de perfil no Zustand (`store/sessionStore`) com limpeza no logout
- Telas de login/registro e home temporária de sessão
- Guard de navegação (`AuthGate`)
- Estratégia de estado: [state-management.md](./state-management.md) / [ADR 0004](./adr/0004-zustand-client-state.md)

### Fora do limite de Auth

- CRUD de dados cadastrais de negócio → futuro **perfil**
- Credenciais Admin / senhas na API → proibido
- Veículos / manutenções → features futuras

### API pública (`@/features/auth`)

| Export | Uso externo |
| --- | --- |
| `AuthProvider`, `AuthGate`, `useAuth` | Root layout / composição |
| `useSessionStore`, `ProfileStatus` | Slice de perfil / limpeza de sessão |
| `LoginScreen`, `RegisterScreen`, `SessionHomeScreen` | Rotas |
| `mapFirebaseError`, schemas | Formulários / testes |
| `User`, `UserProfileUpdate`, `AuthCredentials` | Contratos tipados |
| `useGoogleSignIn` | Tela de login |

### Rotas finas

```tsx
// src/app/(auth)/login.tsx
import { LoginScreen } from '@/features/auth';
export default LoginScreen;
```

### Adapters e mock

- Transporte HTTP: `src/services/api/client.ts`
- Firebase init: `src/services/firebase.ts`
- Bootstrap com mock: `features/auth/services/bootstrapProfile.ts` quando `EXPO_PUBLIC_API_MOCK=true` — **não** é integração de produção; documentado em `docs/auth.md`

## Limites futuros (sem implementação)

### Perfil (`features/profile` — planejado)

- Ler/editar dados cadastrais (`name`, `cnh`, `document`, …)
- **Não** gerencia senha, tokens ou Firebase Auth
- Consome `useAuth()` / `User` via API pública de auth ou DTOs próprios mapeados na borda

### Veículos (`features/vehicles` — planejado)

- Listagem/CRUD de veículos do usuário autenticado
- Identidade via `firebaseUid` resolvido no backend; UI não autoriza por e-mail

### Manutenções (`features/maintenance` — planejado)

- Histórico e operações ligadas a um veículo
- Recebe `vehicleId` por contrato explícito (params/props), sem acoplar a arquivos internos de vehicles

### Compartilhado

- `components/ui`, `theme`, utils sem domínio
- Sem lógica de negócio

## Regras de import (checklist)

1. `src/app` não acessa Firebase/HTTP diretamente.
2. Feature não importa `src/app/*`.
3. Feature A não importa `features/B/...` interno — só `@/features/B`.
4. `services` / `config` / `theme` / `components/ui` não importam `features` nem `app`.
5. Tipos começam na feature; sobem para `src/types` só com uso compartilhado real.

## Verificação de dependências circulares

Método usado nesta tarefa:

```bash
node scripts/check-feature-deps.mjs
```

O script analisa imports `@/` em `src/` e falha se:

- `services|config|theme|components/ui` → `features|app`
- `features` → `app`
- ciclo `features/A` ↔ `features/B`

## Exceções conhecidas

- Componentes legados do template Expo (`themed-text`, `constants/theme`) ainda usados em Explore; fora do Design System novo.
- `SessionHomeScreen` fica em auth até existir home/domínio de perfil — provisório e documentado.

## Relacionados

- ADRs: [`docs/adr/README.md`](./adr/README.md)
- Log de movimentações (ATP-7): `docs/architecture-moves.md`
- Auth Firebase / identidade: `docs/auth.md`
- Design System: `docs/design-system.md`
