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
## Mobile

| Peça | Caminho |
| --- | --- |
| Rota Home | `src/app/(tabs)/index.tsx` → `DashboardScreen` |
| Feature | `src/features/home/` |
| Agrupamento/contagens | `src/features/home/lib/kanban.ts` |
| HTTP | `listMaintenances` (`GET /v1/maintenances`), `createVehicleMaintenance`, `updateMaintenance`, `listVehicles`, `createVehicle` |

Filtro “Todos os veículos” chama `GET /v1/maintenances` (lista completa do usuário) para contagens consistentes. Com veículo selecionado, usa `?vehicleId=`.

## Orçamentos (ATP-38)

O código tipado de orçamentos permanece em `src/features/estimates/` e `src/services/api/estimates.ts`, mas a **Home não consome** `/v1/estimates` enquanto o deploy publicado não expõe essas rotas (OpenAPI atual: só Maintenance). Modelo canônico na API: [repair-estimates-model.md](https://github.com/EngJao89/autotrack-api/blob/master/docs/repair-estimates-model.md).

## Fora deste corte (kanban)

Drag-and-drop, reopen/cancelamento a partir de `DONE`, offline-first, feature completa de perfil.

Cadastro completo de veículos: [vehicles.md](./vehicles.md) (ATP-37). A Home mantém o sheet mínimo de criação via `@/features/vehicles`.
