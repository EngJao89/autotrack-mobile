# AutoTrack Mobile

Aplicativo mobile do **AutoTrack** — acompanhamento de veículos e manutenções.

Este repositório é a base do app cliente (Expo / React Native / TypeScript). Ele consome a API backend [`autotrack-api`](https://github.com/EngJao89/autotrack-api).

> **Status:** `Unreleased`. Escopo do MVP: [docs/mvp-scope.md](./docs/mvp-scope.md). Arquitetura feature-first: [docs/architecture.md](./docs/architecture.md). Estado (Zustand): [docs/state-management.md](./docs/state-management.md). Decisões (ADR): [docs/adr/README.md](./docs/adr/README.md). Design System e auth: [docs/design-system.md](./docs/design-system.md), [docs/auth.md](./docs/auth.md).  
> Fronteira API ↔ Mobile (canônica na API, ATP-13): [autotrack-api `docs/api-mobile-boundary.md`](https://github.com/EngJao89/autotrack-api/blob/master/docs/api-mobile-boundary.md).

## Stack inicial

| Tecnologia | Uso |
| --- | --- |
| [Expo](https://expo.dev) SDK 57 | Runtime e tooling mobile |
| [React Native](https://reactnative.dev) | UI nativa multiplataforma |
| [TypeScript](https://www.typescriptlang.org) | Tipagem estática |
| [Expo Router](https://docs.expo.dev/router/introduction/) | Rotas baseadas em arquivos (`src/app/`) |
| [Zustand](https://zustand.docs.pmnd.rs/) | Estado cliente compartilhado (perfil/sessão local) |
| [Axios](https://axios-http.com/) | Cliente HTTP compartilhado para a `autotrack-api` |
| npm | Gerenciador de pacotes (fixado via `package-lock.json`) |

## Pré-requisitos

| Ferramenta | Versão mínima |
| --- | --- |
| Node.js | `>= 22.13.0` (recomendado: LTS 22 — ver `.nvmrc`) |
| npm | `>= 10` |
| Git | qualquer versão recente |
| Expo Go ou emulador | opcional para testar no dispositivo |

Ferramentas úteis: [nvm](https://github.com/nvm-sh/nvm) (ou equivalente) e o app [Expo Go](https://expo.dev/go).

## Instalação

```bash
git clone https://github.com/EngJao89/autotrack-mobile.git
cd autotrack-mobile
npm install
cp .env.example .env
```

Edite `.env` com valores locais. **Não** committe o arquivo `.env`.

## Execução local

```bash
npm start
```

No terminal do Metro/Expo:

- `a` — Android (emulador/dispositivo)
- `i` — iOS (simulador, macOS)
- `w` — web
- escaneie o QR code com o Expo Go

Atalhos equivalentes:

```bash
npm run android
npm run ios
npm run web
```

## Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `npm install` | Instala dependências |
| `npm start` | Inicia o servidor de desenvolvimento Expo |
| `npm run android` | Abre no Android |
| `npm run ios` | Abre no iOS |
| `npm run web` | Abre no navegador |
| `npm run lint` | Executa o ESLint |
| `npm run typecheck` | Verifica tipos com TypeScript (`tsc --noEmit`) |
| `npm test` | Testes unitários (`node:test`) |
| `npm run notion:list` | Lista tasks do board Notion (requer `NOTION_TOKEN`) |
| `npm run notion:show` | Detalhes + critérios de aceite de uma task |
| `npm run notion:suggest-branch` | Sugere nome de branch (não altera git) |
| `npm run notion:create-branch` | Cria branch local (sem push; não escreve no Notion) |
| `npm run check:deps` | Valida limites de import feature-first |
| `npm run commit` | Abre o assistente Commitizen (Conventional Commits) |

> **Testes:** `npm test` cobre config Firebase, auth, `sessionStore` e geração de branch Notion. UI/E2E ainda planejada.  
> Workflow Notion (ATP-34): [docs/notion-task-workflow.md](./docs/notion-task-workflow.md).

## Estrutura do projeto

```text
autotrack-mobile/
├── assets/
├── docs/
│   ├── adr/                # Architecture Decision Records (ATP-4)
│   ├── architecture.md     # Feature-first (ATP-7)
│   ├── state-management.md # Ownership de estado (ATP-3)
│   ├── mvp-scope.md             # Escopo MVP + aceite (ATP-6)
│   ├── notion-task-workflow.md  # CLI Notion → branch (ATP-34)
│   ├── notion-github.md         # Link Preview / convenções
│   ├── auth.md
│   └── design-system.md
├── scripts/
│   ├── notion/             # Tooling Notion (ATP-34)
│   └── check-feature-deps.mjs
├── src/
│   ├── app/                # Rotas finas (Expo Router)
│   ├── features/
│   │   └── auth/           # Feature de referência (sessão, login, bootstrap)
│   ├── components/ui/      # Design System
│   ├── theme/              # Tokens + ThemeProvider
│   ├── services/           # Infra: Firebase init + HTTP client
│   ├── config/             # Env público + validação
│   ├── constants/          # Legado do template Expo
│   ├── hooks/              # Hooks genéricos
│   └── types/              # Tipos compartilhados justificados (ex.: css.d.ts)
├── .env.example
├── app.json
├── package.json
├── CHANGELOG.md
└── README.md
```

Convenções e limites: [docs/architecture.md](./docs/architecture.md).  
ADRs (Firebase, persistência, fronteira API/Mobile, Zustand): [docs/adr/README.md](./docs/adr/README.md).  
Estado cliente: [docs/state-management.md](./docs/state-management.md).  
Catálogo visual: rota `/design-system` (aba **UI Kit**).  
Features futuras (perfil, veículos, manutenções) têm limites documentados — **sem** pastas vazias nesta fase.

Código de rota fica em `src/app/` e apenas reexporta/compõe features.

## Convenções de Git

### Branches

| Tipo | Padrão |
| --- | --- |
| Principal | `main` (alinhar default remoto quando aplicável) |
| Feature | `feature/ATP-XX-descricao-curta` |
| Correção | `fix/ATP-XX-descricao-curta` |
| Documentação | `docs/ATP-XX-descricao-curta` |
| Chore / setup | `chore/ATP-XX-descricao-curta` |

### Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/), incluindo o ID da tarefa quando houver:

```text
chore(mobile): bootstrap Expo TypeScript repository [ATP-10]
docs(mobile): add project setup guide [ATP-10]
feat(mobile): add vehicle list screen [ATP-XX]
fix(mobile): correct splash screen flicker [ATP-XX]
```

Use `npm run commit` para gerar a mensagem com Commitizen.

### Pull Requests

1. Crie a branch a partir de `main` (ou da branch base do fluxo atual).
2. Implemente a mudança com commits pequenos e descritivos.
3. Rode `npm run lint` e `npm run typecheck` antes de abrir o PR.
4. Descreva motivação, escopo e plano de teste no PR (use o template em `.github/pull_request_template.md`).
5. Inclua `[ATP-XX]` no título do PR para vínculo com o board Notion.
6. Solicite review conforme o fluxo do time.

Board Notion (Link Preview): [docs/notion-github.md](./docs/notion-github.md).  
Consultar tasks / gerar branch: [docs/notion-task-workflow.md](./docs/notion-task-workflow.md).

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | URL base da `autotrack-api` **sem** `/v1` (Render: `https://autotrack-api-5r68.onrender.com`) |
| `EXPO_PUBLIC_API_TIMEOUT_MS` | Timeout Axios em ms (default `30000`) |
| `EXPO_PUBLIC_API_MOCK` | Fallback explícito de perfil se a API falhar (`false` contra API real) |
| `EXPO_PUBLIC_APP_ENV` | Ambiente (`development`, `staging`, `production`) |

Somente variáveis com prefixo `EXPO_PUBLIC_` ficam disponíveis no cliente Expo. Segredos administrativos (service accounts, chaves privadas) **não** pertencem a este repositório.

## Segurança

- Não versionar `.env`, tokens, chaves, certificados, `google-services.json`, `GoogleService-Info.plist` ou service accounts.
- Use `.env.example` apenas com **nomes** de variáveis.
- `app.json` / config Expo não devem conter segredos.
- Credenciais Firebase administrativas ficam exclusivamente no backend (`autotrack-api`).

O `.gitignore` já cobre `node_modules`, caches Expo/Metro, pastas nativas geradas, arquivos `.env*` (exceto `.env.example`) e artefatos sensíveis comuns.

## API / backend

O mobile consome a **autotrack-api**:

- Repositório: https://github.com/EngJao89/autotrack-api
- Ambiente publicado (Render): https://autotrack-api-5r68.onrender.com
- Health: `GET /v1/health` · OpenAPI: `/api/docs` · JSON: `/api/docs-json`
- Cliente Axios compartilhado: [docs/api-client.md](./docs/api-client.md) (`ATP-40`)

Auth de usuários permanece no **Firebase**; perfil/veículos/manutenções usam Bearer ID Token na API.  
Política: timeout configurável; 401 com no máximo uma renovação de token; logout cancela requests pendentes; mock só com `EXPO_PUBLIC_API_MOCK=true` (explícito na UI).

## Contribuição

1. Clone o repositório e instale as dependências (`npm install`).
2. Crie uma branch seguindo as convenções acima.
3. Faça as alterações e valide com `npm run lint` e `npm run typecheck`.
4. Abra um Pull Request descrevendo o que mudou e como testar.
5. Aguarde review e CI (quando disponível) antes do merge.

## Roadmap (alto nível)

| Etapa | Escopo |
| --- | --- |
| ✅ ATP-10 | Bootstrap do repositório, README, lint/typecheck, estrutura inicial |
| ✅ ATP-8 | Design System inicial (tokens, primitivos, catálogo) |
| ✅ ATP-31 | Auth Firebase no mobile + vínculo/bootstrap de perfil (mock-ready) |
| ✅ ATP-32 | Correção cadastro Firebase (API key / mensagens) |
| ✅ ATP-7 | Arquitetura feature-first documentada + Auth como referência |
| ✅ ATP-4 | ADRs iniciais (Firebase, persistência na API, fronteira REST `/v1`) |
| ✅ ATP-3 | Estratégia de estado (Zustand + PoC de perfil / isolamento de sessão) |
| ✅ ATP-34 | Tooling Notion: consultar tasks, detalhes e gerar/criar branch |
| ✅ ATP-6 | Escopo do MVP e critérios de aceite documentados |
| ✅ ATP-36 | Login/cadastro UX + recuperação de senha Firebase |
| ✅ ATP-40 | Cliente Axios compartilhado + API Render (`docs/api-client.md`) |
| Planejado | Features Mobile: perfil, veículos, manutenções (jornadas do MVP) |
| Planejado | CI/CD, EAS Build e publicação nas stores |

## Licença

Distribuído sob a licença MIT — ver [LICENSE](./LICENSE).
