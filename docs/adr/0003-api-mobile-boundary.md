# ADR 0003 — Fronteira API/Mobile: REST `/v1` e contratos

- **Status:** Aceito
- **Data:** 2026-10-14
- **Escopo:** Transversal
- **Responsáveis / revisores:** time AutoTrack (registro via PR ATP-4)

## Contexto e problema

`autotrack-mobile` e `autotrack-api` são repositórios separados. É preciso deixar explícito o que cada lado faz, qual contrato de integração existe hoje, o que ainda é mock/pendente, e que **não** se assume cliente gerado por OpenAPI até outra decisão.

## Restrições relevantes

- Repositórios distintos (sem monorepo nesta fase).
- API: NestJS modular, REST versionado `/v1`, OpenAPI/Swagger no backend (ATP-15).
- Mobile: Expo; auth via Firebase ID Token (ADR 0001).
- Não fechar nesta ADR: state management, navegação definitiva, geração OpenAPI client.

## Alternativas consideradas

1. **BFF / GraphQL no mobile** — flexível, mas adiciona camada não prevista no MVP.
2. **Cliente OpenAPI gerado desde o dia 1** — desejável depois; ainda não há pipeline aceito no mobile.
3. **Contratos manuais + fetch tipado (atual)** — alinhado ao código existente (`apiRequest`).

## Decisão

### Responsabilidades

| Camada | Faz | Não faz |
| --- | --- | --- |
| **Mobile** | UI, sessão Firebase, obter ID Token, chamar REST com Bearer, mapear erros de UX | Validar token Admin, persistir domínio, armazenar senha |
| **API** | Validar ID Token, perfil local (`firebaseUid`), regras de negócio, persistência | Emitir senha própria do app, guardar refresh tokens Firebase |

### Contrato de integração (estado atual)

- Base URL: `EXPO_PUBLIC_API_URL`
- Auth header: `Authorization: Bearer <firebase-id-token>`
- Bootstrap de perfil autenticado:
  - Preferido: `POST /v1/auth/bootstrap`
  - Fallback: `GET /v1/users/me`
- Transporte: `src/services/api/client.ts` (fetch + JSON)
- Operações de domínio de auth: `src/features/auth/services/bootstrapProfile.ts`

### Adapters de desenvolvimento

- `EXPO_PUBLIC_API_MOCK=true`: se a API falhar/indisponível, cria perfil mock a partir do usuário Firebase.
- Mock é **explícito** na UI (badge “Mock API”); não deve ser tratado como integração real.

### Pendente (não assumir pronto)

- Demais endpoints de perfil/veículos/manutenções em produção no mobile
- Cliente TypeScript gerado via OpenAPI
- Fechar activity de fronteira de integração completa além desta ADR de princípio

**Intenção futura:** alinhar tipos do mobile aos schemas OpenAPI da API; possíveis ADRs de client generation e estado.

## Consequências

### Positivas

- Fronteira clara app ↔ API; facilita testes e ownership.
- Versionamento `/v1` permite evolução sem acoplar releases cegamente.
- Mocks documentados reduzem confusão em demos locais.

### Custos, riscos e limitações

- Contratos manuais podem divergir do OpenAPI até haver geração/checagem.
- Endpoints ainda em construção na API exigem mock e tolerância a 404/5xx.
- Dois repositórios = dois índices ADR; exige referência cruzada disciplinada.

## Plano de adoção / migração

1. Manter cliente HTTP manual e ADRs 0001–0003 como base.
2. Quando OpenAPI da API estabilizar, abrir ADR específica de geração de client (backlog).
3. Substituir mock por chamadas reais endpoint a endpoint, sem mudar o princípio Bearer + `/v1`.

## Referências

- `docs/auth.md`, `docs/architecture.md`
- `.env.example` (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_MOCK`)
- Código: `src/services/api/client.ts`, `src/features/auth/services/bootstrapProfile.ts`
- API: https://github.com/EngJao89/autotrack-api
- Tarefas: ATP-4, ATP-10, ATP-31, ATP-30 (API)
- Relacionados: ADR 0001 (identidade), ADR 0002 (persistência na API)

## Histórico

| Data | Evento |
| --- | --- |
| 2026-10-14 | Registro inicial (ATP-4) |
