# Escopo do MVP e critérios de aceite — AutoTrack

Documento da **[ATP-6](https://www.notion.so/Definir-escopo-do-MVP-e-crit-rios-de-aceite-3ece535b5fd68168a1bef8ea4046c7f2)**  
**Status:** Escopo proposto e registrado no Mobile (aprovação de produto = merge/revisão deste doc).  
**Natureza:** definição de produto e planejamento — **não** significa que o MVP está implementado, testado ou publicado.

Card Notion: [Definir escopo do MVP e critérios de aceite](https://www.notion.so/Definir-escopo-do-MVP-e-crit-rios-de-aceite-3ece535b5fd68168a1bef8ea4046c7f2)

---

## 1. Objetivo

Definir e aprovar o **menor conjunto de jornadas integradas** que demonstre o valor do AutoTrack:

> Um usuário autentica, acessa seu perfil, cadastra veículos e acompanha manutenções com dados **persistidos** e **isolados por proprietário**.

## 2. Público e problema

| Item | Definição |
| --- | --- |
| **Público inicial** | Pessoa que deseja organizar os próprios veículos e o histórico de manutenção |
| **Problema** | Manter informações básicas do veículo e serviços realizados em um único lugar |
| **Fora do problema (MVP)** | Rastreamento GPS em tempo real, frota multiempresa, oficina B2B, marketplace |

A descrição genérica da API como “rastreamento veicular” **não** inclui GPS no MVP.

## 3. Resultado de valor (demo)

Em uma demonstração **reproduzível**:

1. O usuário entra (Firebase: e-mail/senha ou Google).
2. O perfil local é criado/sincronizado via API (`bootstrap`).
3. Cadastra **pelo menos um** veículo.
4. Registra **pelo menos uma** manutenção nesse veículo.
5. Consulta o histórico.
6. Ao reabrir o app (nova sessão), encontra os **mesmos dados**.
7. Não visualiza dados de **outra conta**.

## 4. Escopo funcional (aprovado)

### 4.1 Jornadas do MVP

| # | Jornada | Mobile | API |
| --- | --- | --- | --- |
| J1 | Cadastro / login Firebase | Telas auth existentes | Validação ID Token |
| J2 | Bootstrap / leitura de perfil | Home de sessão → evoluir para feature perfil | `POST /v1/auth/bootstrap`, `GET /v1/users/me` |
| J3 | Editar dados cadastrais básicos do perfil | Feature `profile` | `PATCH/PUT /v1/users/:id` (campos mutáveis) |
| J4 | Listar / criar / editar / remover veículo | Feature `vehicles` | `/v1/vehicles` |
| J5 | Listar / criar / editar / remover manutenção do veículo | Feature `maintenance` | `/v1/vehicles/:id/maintenances`, `/v1/maintenances/:id` |
| J6 | Isolamento por dono | UI só consome “meus” recursos | Ownership no backend (já no contrato Vehicles/Maintenance) |
| J7 | Persistência entre sessões | Reabrir app autenticado | PostgreSQL via Prisma |

### 4.2 Capacidade mínima por domínio

**Auth / sessão**

- Login e registro e-mail/senha; Google via fluxo já adotado.
- Sessão Firebase explícita; tokens só sob demanda (não em store persistido).
- Logout limpa estado cliente privado (perfil, seleção de veículo).

**Perfil**

- Exibir e-mail / nome / `firebaseUid` (leitura).
- Editar campos de negócio permitidos pela API (`name`, documentos/telefone conforme contrato) — **sem** senha/token.

**Veículos**

- CRUD do veículo do usuário autenticado (campos mínimos alinhados à API: identificação básica do veículo — placa/modelo/ano conforme DTOs atuais).
- Lista vazia tratada como estado válido (empty), não erro.

**Manutenções**

- CRUD ligado a um `vehicleId` do usuário.
- Histórico ordenado (mais recente → mais antiga), conforme API.
- Sem veículo selecionado: fluxo guia para cadastrar/selecionar veículo.

### 4.3 Qualidade mínima da demo

- Ambiente: API (local Docker/PostgreSQL **ou** Render demo) + Mobile (Expo Go / dev build).
- `EXPO_PUBLIC_API_MOCK=false` na demo de valor (mock ≠ MVP integrado).
- Lint / typecheck / testes existentes verdes nos dois repos no momento da demo.
- Erros de rede/API visíveis ao usuário (mensagem clara; sem crash silencioso).

## 5. Fora de escopo do MVP

| Tema | Motivo |
| --- | --- |
| GPS / telemetria em tempo real | Fora do problema do público inicial |
| Offline-first, filas, sync complexo | Custo alto; não necessário para demo |
| Multi-tenant / oficinas / papéis (admin mecânico) | Expansão pós-MVP |
| Notificações push, billing, assinatura | Não essenciais à jornada núcleo |
| OpenAPI client gerado no Mobile | Planejado (ATP-12); MVP pode usar client HTTP tipado manual |
| Design System completo / branding final | Já há base; polish visual não bloqueia valor |
| Publicação nas stores / EAS production | Pós-MVP |
| CI/CD Mobile completo / E2E Detox | Desejável; não bloqueia definição do escopo |
| Alterar contratos da API só por conveniência do Mobile | Fronteira ATP-13 / ADR 0003 |

## 6. Critérios de aceite (desta ATP-6)

A **ATP-6** está aceita quando:

- [x] Público, problema e resultado de valor estão escritos e alinhados ao card Notion.
- [x] Jornadas J1–J7 e capacidades mínimas estão documentadas.
- [x] Fora de escopo está explícito (inclui GPS).
- [x] Estado atual Mobile vs API está classificado (entregue / parcial / pendente) — §7.
- [x] Backlog rastreável mapeia gaps → ATPs / features — §8.
- [x] README do Mobile referencia este documento.
- [ ] Revisão humana no PR confirma o escopo como **aprovado** (merge = aprovação).

> Concluir ATP-6 **não** marca J3–J5 como Done no produto.

## 7. Estado atual confirmado (auditoria)

Referência: `autotrack-mobile` e `autotrack-api` em outubro/2026.

| Capacidade | API | Mobile | Classificação |
| --- | --- | --- | --- |
| Auth Firebase + Bearer | Entregue | Entregue (telas + AuthProvider) | Base OK |
| Bootstrap / perfil leitura | Entregue | Parcial (bootstrap + home sessão; mock possível) | Gap: demo sem mock |
| Edição de perfil | Entregue | Pendente (`features/profile`) | Gap MVP |
| Vehicles CRUD + ownership | Entregue | Pendente (`features/vehicles`) | Gap MVP |
| Maintenance CRUD + histórico | Entregue | Pendente (`features/maintenance`) | Gap MVP |
| Isolamento entre contas | Entregue (API) | Depende das features | Gap até UI consumir API |
| Persistência | PostgreSQL | N/A (cliente) | OK no backend |
| Design System / feature-first / ADRs / estado (Zustand) | N/A | Entregue (base) | Não é jornada de negócio |

**Conclusão:** o **backend do MVP** está substancialmente pronto; o **Mobile de negócio** (perfil editável, veículos, manutenções + API real) é o caminho crítico.

## 8. Rastreabilidade no backlog

| Entrega pós-ATP-6 | Onde | Notas |
| --- | --- | --- |
| Feature perfil (edição + leitura API real) | Mobile — `features/profile` | Relacionar a ATP-29 / perfil se existir no board |
| Feature veículos | Mobile — `features/vehicles` | Consumir `/v1/vehicles` |
| Feature manutenções | Mobile — `features/maintenance` | Consumir rotas de maintenance |
| Navegação definitiva (tabs: Home / Veículos / Perfil) | Mobile — Expo Router | Substituir home temporária de sessão |
| Desligar mock na demo | Mobile — env | `EXPO_PUBLIC_API_MOCK=false` + API up |
| Fronteira / contratos | Já docs | [api-mobile-boundary](https://github.com/EngJao89/autotrack-api/blob/master/docs/api-mobile-boundary.md) (API ATP-13) + ADR 0003 Mobile |
| Cliente OpenAPI | Planejado | ATP-12 — não bloqueia MVP se client manual tipado existir |

Atualizar status das ATPs de implementação no Notion **somente** quando o código correspondente for entregue.

## 9. Roteiro de demonstração (quando o MVP estiver implementado)

1. Subir API (`docker compose` + migrate) ou usar Render demo.
2. Configurar `.env` Mobile com `EXPO_PUBLIC_API_URL` e `EXPO_PUBLIC_API_MOCK=false`.
3. Criar conta A → bootstrap → criar veículo → criar manutenção → listar.
4. Logout / login novamente → dados persistem.
5. Conta B → não vê veículo/manutenção da conta A.
6. Registrar evidências (prints/vídeo) na ATP de implementação correspondente — **não** nesta ATP-6.

## 10. Branch e commit (ATP-6)

```text
Branch:  docs/ATP-6-mvp-scope
Commit:  docs(mobile): define MVP scope and acceptance criteria [ATP-6]
```

## 11. Referências

- Card: [ATP-6 no Notion](https://www.notion.so/Definir-escopo-do-MVP-e-crit-rios-de-aceite-3ece535b5fd68168a1bef8ea4046c7f2)
- [docs/architecture.md](./architecture.md) — feature-first
- [docs/adr/0003-api-mobile-boundary.md](./adr/0003-api-mobile-boundary.md)
- [docs/state-management.md](./state-management.md)
- API: https://github.com/EngJao89/autotrack-api
