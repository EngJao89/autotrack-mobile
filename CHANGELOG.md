# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere a [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added

- Dashboard de manutenção com kanban (A fazer / Em andamento / Concluído), filtro por veículo, cadastro mínimo de veículo/reparo e Home de produto no lugar da home técnica (`ATP-39`)
- Cliente HTTP Axios compartilhado (`src/services/api`), timeout configurável, cancelamento no logout, serviços tipados de health/users/vehicles/maintenances e integração com a API no Render (`ATP-40`)
- Recuperação de senha via Firebase (`/(auth)/forgot-password`), UX enumeration-safe e retry de bootstrap de perfil sem recriar usuário (`ATP-36`)
- Escopo do MVP e critérios de aceite, com auditoria Mobile/API e rastreabilidade de backlog (`ATP-6`)
- Tooling Notion no Mobile: CLI para listar/mostrar tasks, sugerir ou criar branch local, docs e testes (`ATP-34`)
- Esquema Notion Link Preview + template de PR com vínculo ATP (`docs/notion-github.md`)
- Estratégia de gerenciamento de estado com Zustand: `sessionStore`, PoC de perfil autenticado, limpeza no logout, docs e ADR 0004 (`ATP-3`)
- Índice e template de ADRs em `docs/adr/`, com três decisões prioritárias (Firebase, persistência na API, fronteira API/Mobile) (`ATP-4`)

### Changed

- Tab Home passa a renderizar `DashboardScreen` (produto), sem diagnóstico/token na entrada autenticada (`ATP-39`)
- Transporte HTTP migrado de `fetch` para Axios; bootstrap alinha resposta `{ created, user }` do contrato OpenAPI (`ATP-40`)
- Login/cadastro: bloqueio de envio duplicado, link “Esqueci minha senha” e feedback de sessão/perfil na home (`ATP-36`)
- Consolidação feature-first: Auth como módulo de referência, rotas finas, `docs/architecture.md` e `npm run check:deps` (`ATP-7`)

### Fixed

- Cadastro Firebase com API key inválida: validação do `firebaseConfig` Web, bloqueio de chave privada no cliente e mensagens amigáveis (`ATP-32`)

### Added

- Autenticação Firebase no mobile (e-mail/senha + Google via AuthSession), AuthProvider, bootstrap de perfil com mock enquanto a API sobe (`ATP-31`)
- Documentação em `docs/auth.md` e variáveis Firebase/Google em `.env.example`
- Design System inicial com tokens tipados, temas light/dark, primitivos UI e catálogo `/design-system` (`ATP-8`)
- Documentação em `docs/design-system.md`
- Bootstrap do repositório Expo + React Native + TypeScript (`ATP-10`)
- README inicial com visão geral, pré-requisitos, instalação, execução e contribuição
- `.env.example` com variáveis públicas documentadas (sem segredos)
- ESLint (`eslint-config-expo`) e Prettier
- Scripts `lint` e `typecheck`
- Convenções de branches e Conventional Commits documentadas
