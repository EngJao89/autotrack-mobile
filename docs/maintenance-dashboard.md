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

## Detalhe no bottom sheet (ATP-48)

O botão **Detalhes** abre `RepairDetail` (somente leitura) com seções Resumo / Veículo / Serviço / Datas e valores.

| Campo API (`Maintenance`) | Rótulo UI |
| --- | --- |
| `description` ou `type` | Serviço (título) |
| `status` | Status |
| `type` | Tipo |
| `description` | Descrição (omitida se vazia) |
| `notes` | Observações (omitida se vazia) |
| veículo (`brand`/`model`/`year`) | Veículo |
| `licensePlate` do veículo | Placa (omitida se vazia) |
| `odometerKm` da manutenção | Quilometragem (`Não informado` se null; **não** usa km do veículo) |
| `serviceDate` | Data prevista (TODO/IN_PROGRESS) ou Data do serviço (DONE) |
| `costCents` | Valor do serviço BRL (`Não informado` se null; não inventa R$ 0,00) |
| `workshopName` | Oficina (omitida se vazia) |

Omitidos de propósito: `id`, `vehicleId`, `createdAt`, `updatedAt`. Sem itens de peça/mão de obra — o contrato atual de `Maintenance` não possui linhas.

## Fora deste corte (kanban)

Drag-and-drop, reopen/cancelamento a partir de `DONE`, offline-first, feature completa de perfil.

Cadastro completo de veículos: [vehicles.md](./vehicles.md) (ATP-37). A Home mantém o sheet mínimo de criação via `@/features/vehicles`.
