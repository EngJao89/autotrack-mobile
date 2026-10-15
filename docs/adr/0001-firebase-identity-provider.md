# ADR 0001 — Firebase Authentication como provedor de identidade

- **Status:** Aceito
- **Data:** 2026-10-14
- **Escopo:** Transversal (impacto direto no Mobile; validação na API)
- **Responsáveis / revisores:** time AutoTrack (registro via PR ATP-4)

## Contexto e problema

O AutoTrack precisa autenticar usuários no app Expo e autorizar chamadas à `autotrack-api` sem duplicar sistema de senhas no backend. Credenciais e identidade federada (Google, e-mail/senha) devem ficar em um provedor maduro; o perfil de negócio (CNH, documentos, veículos) é dado local da API.

## Restrições relevantes

- Mobile: Expo / React Native / TypeScript; preferência por Firebase JS SDK (compatível com Expo Go para e-mail/senha).
- API NestJS valida **Firebase ID Token** (Admin SDK); não persiste senha, hash, ID token ou refresh token.
- Identidade estável de autorização: `firebaseUid` (não e-mail sozinho).
- LGPD / segurança: não versionar secrets Admin no cliente; só `EXPO_PUBLIC_*` do app Web.
- Provedores iniciais do produto: Google e e-mail/senha (outros sociais fora do MVP).

## Alternativas consideradas

1. **JWT/sessão própria emitida pela API** — total controle, mas exige recuperação de senha, hashing e superfície de ataque na API; fora do desenho ATP-30/31.
2. **Somente AuthSession OAuth sem Firebase** — possível para Google; complica e-mail/senha e padronização de ID Token para a API.
3. **React Native Firebase (nativo)** — mais capacidades nativas; exige development build e não era necessário para o bootstrap atual.

## Decisão

**Estado atual (confirmado no mobile):**

- Firebase Authentication é o provedor de identidade do app.
- Cadastro/login com e-mail/senha e Google (AuthSession → credential Firebase).
- Após autenticação, o app obtém ID Token e chama a API com `Authorization: Bearer <token>`.
- Bootstrap de perfil: `POST /v1/auth/bootstrap` (fallback `GET /v1/users/me`); com `EXPO_PUBLIC_API_MOCK=true`, adapter mock local se a API indisponível — **mock ≠ integração de produção**.
- Feature `src/features/auth` concentra sessão, telas e bootstrap; infra Firebase em `src/services/firebase.ts`.

**Intenção futura (não fechada neste ADR):**

- Persistência de preferência de tema / e-mail verificado para recursos sensíveis.
- Google Sign-In nativo em development build, se AuthSession for insuficiente.

## Consequências

### Positivas

- Separação clara: credenciais no Firebase; perfil de negócio na API.
- Contrato único de autorização (Bearer ID Token) para mobile e API.
- Reuso de provedores Google e e-mail/senha sem crypto custom.

### Custos, riscos e limitações

- Dependência do Firebase Console (provedores habilitados; config Web correta).
- Client IDs Google e restrições de OAuth no Expo Go.
- Colisão de e-mail e políticas de `email_verified` precisam de regra na API (não inventadas aqui além do já documentado).
- Mock de bootstrap pode mascarar falha de API se não estiver explícito na UI (badge Mock API).

## Plano de adoção / migração

- Já adotado: ATP-31 (auth front), ATP-32 (config/apiKey), docs em `docs/auth.md`.
- API: validação Admin + `firebaseUid` (ATP-30 / módulo auth) — espelhar ADR no `autotrack-api`.
- Remover mock quando `EXPO_PUBLIC_API_URL` estável e bootstrap real validado.

## Referências

- `docs/auth.md`
- `docs/architecture.md` (módulo auth)
- Código: `src/features/auth/**`, `src/services/firebase.ts`, `src/config/env.ts`
- Tarefas: ATP-31, ATP-32, ATP-30 (API), ATP-4
- Repositório cruzado: `autotrack-api` — ADR de identidade Firebase (quando publicado); mesmo tema transversal

## Histórico

| Data | Evento |
| --- | --- |
| 2026-10-14 | Registro inicial (ATP-4), refletindo implementação já presente no mobile |
