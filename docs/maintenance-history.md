# Histórico de manutenções (ATP-46)

Substitui a aba demonstrativa **Explore** (starter Expo) pela tela **Manutenções**: lista virtualizada de cards das manutenções **já realizadas** do usuário autenticado.

Card Notion: [Substituir Explore por histórico de manutenções em cards](https://app.notion.com/p/Substituir-Explore-por-hist-rico-de-manuten-es-em-cards-414e535b5fd68178a647f7a15ba2ef65)

## Escopo deste corte

| Inclui | Não inclui |
| --- | --- |
| Tab **Manutenções** no lugar de Explore | CRUD / detalhes / toque no card |
| Cards com serviço, veículo, data, km e valor (quando houver) | Filtro por veículo |
| Pull-to-refresh + loading / vazio / erro | Anexos, kanban, orçamentos |
| Critério `DONE` documentado | Mudança de contrato na API |
| Testes de mapeamento / filtro / ordenação | Ícones definitivos da tab (ATP-45) |

## Critério de “manutenção realizada”

Contrato canônico: [autotrack-api `docs/maintenance-kanban-model.md`](https://github.com/EngJao89/autotrack-api/blob/master/docs/maintenance-kanban-model.md).

| Conceito | Como entra nesta tela |
| --- | --- |
| Reparo concluído | `Maintenance.status === 'DONE'` |
| A fazer / Em andamento | **Não** listados |
| Orçamento (`/v1/estimates`) | **Não** misturado — entidade separada |
| Status ausente/legado | Tratado como `DONE` (histórico; nunca inventa pendência) |

`serviceDate` em `DONE` é a **data do serviço** (não usar `createdAt` como data de execução).

## Contrato HTTP

| Peça | Valor |
| --- | --- |
| Lista | `GET /v1/maintenances?status=DONE` via `listMaintenances` |
| Veículos (rótulo do card) | `GET /v1/vehicles` via `listVehicles` |
| Paginação | **Ausente** no OpenAPI atual ([api-mobile-boundary](https://github.com/EngJao89/autotrack-api/blob/master/docs/api-mobile-boundary.md) §4) — a tela carrega a lista completa e deduplica por `id` |
| Ordenação | Cliente: `serviceDate` desc, desempate estável por `id` |
| Moeda | `costCents` → BRL na UI; `null` → campo omitido (não inventa R$ 0,00) |

Ownership: Bearer na API — o client **não** envia `userId`. Estado limpo no logout via sessão auth existente.

## Mobile

| Peça | Caminho |
| --- | --- |
| Rota | `src/app/(tabs)/maintenances.tsx` |
| Feature | `src/features/maintenance/` |
| Filtro / sort / card model | `src/features/maintenance/lib/history.ts` |
| Tabs | `src/components/app-tabs.tsx` + `.web.tsx` |

Ícone da aba: reutiliza o asset atual; troca definitiva de ícones fica na **ATP-45**.

## Relação com outras ATPs

- **ATP-39** (dashboard/kanban): fluxo de reparos abertos; esta tela é só histórico `DONE`.
- **ATP-40** / hotfix de endpoint: reutiliza `listMaintenances` já corrigido.
- **ATP-48**: detalhe no bottom sheet da Home — fora do escopo desta lista (sem toque no card).

## Fora de escopo

Cadastro/edição/exclusão, detalhes, anexos, filtros avançados, redesign global de navegação, alterações de domínio/API.
