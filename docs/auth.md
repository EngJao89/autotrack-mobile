# Autenticação — AutoTrack Mobile

Camada de identidade do app Expo (ATP-31), alinhada ao contrato da `autotrack-api` (ATP-30).

## Decisão de arquitetura

Registrada formalmente em [ADR 0001](./adr/0001-firebase-identity-provider.md) e [ADR 0003](./adr/0003-api-mobile-boundary.md).

1. O app autentica no **Firebase Authentication** (Google ou e-mail/senha).
2. O Firebase emite um **ID Token**.
3. O app chama a API com `Authorization: Bearer <firebase-id-token>`.
4. A API valida o token (Firebase Admin), extrai `firebaseUid` e cria/sincroniza o `User` local.
5. A API **não** armazena senha, hash, ID token ou refresh token.

Identidade estável de autorização: **`firebaseUid`**. E-mail é dado do provedor.

## Fluxo de primeira autenticação

1. Login Firebase (Google ou e-mail/senha).
2. App envia Bearer token.
3. API valida assinatura/expiração/audience/issuer.
4. API extrai `uid`, `email`, `email_verified`.
5. Busca usuário por `firebaseUid`.
6. Se não existir: cria perfil mínimo (`POST /v1/auth/bootstrap`) — enquanto a API sobe, o mobile usa **mock** se `EXPO_PUBLIC_API_MOCK=true`.
7. Se existir: sincroniza campos permitidos e segue autenticado.

## Configuração Firebase Console

1. Crie/use o projeto Firebase do AutoTrack.
2. Authentication → Get started (se for a primeira vez) → Sign-in method:
   - habilite **E-mail/senha** (Email/Password) e salve — sem isso o cadastro retorna `auth/configuration-not-found`
   - habilite **Google** se for usar login social
3. Registre um app **Web** (`</>`) e copie **apenas** o `firebaseConfig` para o `.env`.
4. Em Google Cloud / Firebase, configure OAuth client IDs e preencha `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID`.
5. Domínios autorizados e SHA-1 (Android) conforme o ambiente (dev/prod).
6. Reinicie o Metro (`npx expo start`) depois de alterar o `.env`.

### Formato esperado (app Web)

| Variável | Formato |
| --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Começa com `AIza…` (curta, sem espaços) |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `seu-projeto.firebaseapp.com` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | id do projeto |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | `1:…:web:…` (app Web, não iOS/Android) |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | somente números |

**Não cole** no mobile:
- chave privada / PEM (`BEGIN PRIVATE KEY`)
- service account JSON
- código Swift / `AppDelegate`
- Admin SDK

Se uma chave privada foi colada por engano no `.env`, remova-a, use o `apiKey` Web correto e **revogue/rotacione** a chave privada no Google Cloud.

## Variáveis de ambiente

Veja `.env.example`. Todas as chaves do cliente usam prefixo `EXPO_PUBLIC_`.

| Variável | Uso |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | Base da autotrack-api |
| `EXPO_PUBLIC_API_MOCK` | Fallback de perfil local se a API falhar |
| `EXPO_PUBLIC_FIREBASE_*` | Config do app Web Firebase |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | OAuth web (fallback em todas as plataformas) |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Obrigatório no Android se não houver web client id |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Recomendado no iOS (senão usa o web client id) |

## Código relevante

| Caminho | Responsabilidade |
| --- | --- |
| `src/services/firebase.ts` | Init Firebase + persistência AsyncStorage |
| `src/services/auth.ts` | E-mail/senha e credential Google |
| `src/services/api/client.ts` | HTTP + Bearer |
| `src/services/api/auth.ts` | Bootstrap `/v1/auth/bootstrap` (fallback `/v1/users/me` + mock) |
| `src/features/auth/` | AuthProvider, formulários, Google AuthSession |
| `src/app/(auth)/` | Login e registro |
| `src/types/user.ts` | Modelo `User` (sem senha; `firebaseUid` só leitura) |

## Google Sign-In no Expo

Implementação atual: `expo-auth-session` (`useIdTokenAuthRequest`) → `GoogleAuthProvider.credential(idToken)` → Firebase.

- **Web:** funciona com client ID web.
- **iOS/Android:** preferível **development build** (scheme `autotrackmobile`). Expo Go limita redirects OAuth.
- Evolução nativa futura: `@react-native-google-signin/google-signin` (requer native code / EAS).

## Recuperação de senha

Fora do escopo da API. Use os fluxos do Firebase Auth no app (a adicionar quando necessário).

## Segurança / LGPD

- Não versionar `.env`, `google-services.json` com segredos administrativos, tokens ou service accounts.
- Não enviar `firebaseUid` em body de create/update.
- Não logar ID tokens em produção.
- Minimizar dados pessoais no perfil; finalidade documentada no produto.

## Como testar enquanto a API sobe

1. `cp .env.example .env` e preencha Firebase.
2. Deixe `EXPO_PUBLIC_API_MOCK=true`.
3. `npm start` → registre/entre com e-mail/senha.
4. Home deve mostrar perfil com badge **Mock API**.
5. Quando a API estiver pronta: defina `EXPO_PUBLIC_API_URL` e, se quiser, `EXPO_PUBLIC_API_MOCK=false`.
