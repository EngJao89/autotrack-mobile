# Dashboard de manutenção / kanban (ATP-39)

Substitui a Home técnica (`SessionHomeScreen`) pela entrada de produto após autenticação.

## Modelo

Contrato e transições: [autotrack-api `docs/maintenance-kanban-model.md`](https://github.com/EngJao89/autotrack-api/blob/master/docs/maintenance-kanban-model.md).

Resumo:

| Status | Coluna |
| --- | --- |
| `TODO` | A fazer |
| `IN_PROGRESS` | Em andamento |
| `DONE` | Concluído |

- Histórico sem status → tratado como `DONE` (nunca vira pendência inventada).
- Sem reopen a partir de `DONE` neste corte.
- Sem indicadores financeiros / atrasos por `createdAt`.
- Orçamento permanece atividade separada.

## Mobile

| Peça | Caminho |
| --- | --- |
| Rota Home | `src/app/(tabs)/index.tsx` → `DashboardScreen` |
| Feature | `src/features/home/` |
| Agrupamento/contagens | `src/features/home/lib/kanban.ts` |
| HTTP | `listMaintenances`, `createVehicleMaintenance`, `updateMaintenance`, `listVehicles`, `createVehicle` |

Filtro “Todos os veículos” chama `GET /v1/maintenances` (lista completa do usuário) para contagens consistentes.

## Fora deste corte

Drag-and-drop, reopen/cancelamento, orçamento, offline-first, feature completa de veículos/perfil.
