# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere a [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

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
