# Log de movimentações — ATP-7

| De | Para | Motivo |
| --- | --- | --- |
| `src/app/(auth)/login.tsx` (implementação) | `src/features/auth/screens/LoginScreen.tsx` | Tela pertence à feature; rota ficou fina |
| `src/app/(auth)/register.tsx` (implementação) | `src/features/auth/screens/RegisterScreen.tsx` | Idem |
| `src/app/(tabs)/index.tsx` (implementação) | `src/features/auth/screens/SessionHomeScreen.tsx` | Home provisória de sessão autenticada |
| `src/features/auth/useGoogleSignIn.ts` | `src/features/auth/hooks/useGoogleSignIn.ts` | Hook de feature |
| `src/services/auth.ts` | `src/features/auth/services/session.ts` | Operação de domínio (não infra) |
| `src/services/api/auth.ts` | `src/features/auth/services/bootstrapProfile.ts` | Bootstrap de perfil na feature; usa `api/client` |
| `src/types/user.ts` | `src/features/auth/types/user.ts` | Tipo próximo ao consumidor atual; exportado na API pública |
| (novo) `AuthGate` em `_layout` | `src/features/auth/AuthGate.tsx` | Guard na feature; app só compõe |

## Não movido (infra / compartilhado)

- `src/services/firebase.ts` — init Firebase
- `src/services/api/client.ts` — transporte HTTP
- `src/config/*`, `src/theme/*`, `src/components/ui/*`
