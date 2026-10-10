# AutoTrack Mobile

Aplicativo mobile do **AutoTrack** — acompanhamento de veículos e manutenções.

Este repositório é a base do app cliente (Expo / React Native / TypeScript). Ele consome a API backend [`autotrack-api`](https://github.com/EngJao89/autotrack-api).

> **Status:** `Unreleased`. Design System e autenticação Firebase (front) disponíveis — ver [docs/design-system.md](./docs/design-system.md) e [docs/auth.md](./docs/auth.md). Integração completa com a API, navegação definitiva e módulos de negócio seguem em tarefas futuras.

## Stack inicial

| Tecnologia | Uso |
| --- | --- |
| [Expo](https://expo.dev) SDK 57 | Runtime e tooling mobile |
| [React Native](https://reactnative.dev) | UI nativa multiplataforma |
| [TypeScript](https://www.typescriptlang.org) | Tipagem estática |
| [Expo Router](https://docs.expo.dev/router/introduction/) | Rotas baseadas em arquivos (`src/app/`) |
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
| `npm run commit` | Abre o assistente Commitizen (Conventional Commits) |

> **Testes unitários:** script `test` ainda não configurado (planejado). Não há comando de teste prometido neste README.

## Estrutura do projeto

```text
autotrack-mobile/
├── assets/                 # Imagens, ícones e fontes
├── docs/                   # Documentação técnica (ex.: design system)
├── scripts/                # Utilitários de manutenção (ex.: reset do template)
├── src/
│   ├── app/                # Rotas ((auth), (tabs)) — Expo Router
│   ├── components/
│   │   └── ui/             # Primitivos do Design System
│   ├── config/             # Env público do cliente
│   ├── features/auth/      # AuthProvider e fluxos de login
│   ├── services/           # Firebase + cliente HTTP da API
│   ├── constants/          # Constantes legadas do template Expo
│   ├── hooks/              # Hooks compartilhados
│   ├── theme/              # Tokens tipados + ThemeProvider
│   └── types/              # Tipos de domínio (User, etc.)
├── .env.example            # Nomes das variáveis de ambiente (sem segredos)
├── app.json                # Configuração Expo (sem segredos)
├── eslint.config.js        # ESLint + Prettier
├── package.json
├── tsconfig.json
├── CHANGELOG.md
└── README.md
```

Catálogo visual em desenvolvimento: rota `/design-system` (aba **UI Kit**).

Pastas como `features/`, `services/` e `utils/` serão introduzidas quando houver código real correspondente — evitando módulos vazios prematuros.

Código de rota fica em `src/app/`. Componentes, hooks e utilitários **não** devem ser criados dentro de `src/app/`.

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
4. Descreva motivação, escopo e plano de teste no PR.
5. Solicite review conforme o fluxo do time.

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | URL base da `autotrack-api` |
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

Integração de produção, autenticação e contratos de endpoints serão tratados em tarefas posteriores.

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
| Planejado | Navegação definitiva, perfil de negócio (ATP-29) |
| Planejado | Integração com `autotrack-api` |
| Planejado | Módulos (usuários, veículos, manutenções) |
| Planejado | CI/CD, EAS Build e publicação nas stores |

## Licença

Distribuído sob a licença MIT — ver [LICENSE](./LICENSE).
