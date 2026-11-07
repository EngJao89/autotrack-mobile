# Cadastro e gestão de veículos (ATP-37)

Consolidação da jornada Mobile de listagem, cadastro, detalhe, edição e exclusão de veículos próprios, consumindo o CRUD já existente na `autotrack-api`.

Card Notion: [Melhorar cadastro e gestão de veículos no Mobile e API](https://app.notion.com/p/Melhorar-cadastro-e-gest-o-de-ve-culos-no-Mobile-e-API-407e535b5fd681899cb7f90e0386d682)

## Escopo deste corte

| Inclui | Não inclui |
| --- | --- |
| Feature `features/vehicles` + tab **Veículos** | Alterar contratos OpenAPI / DTOs da API |
| Formulário com marca/modelo/ano + opcionais | Unicidade global de placa |
| Validação de ano e quilometragem no cliente | Offline-first / TanStack Query |
| Placa: trim + uppercase (espelha DTO da API) | GPS / frota multiempresa |
| Loading, vazio, erro + retry; refetch no foco e após escrita | Adapter `X-User-Id` no app distribuído |
| Limpeza de `selectedVehicleId` ao excluir o selecionado | CRUD de manutenções/orçamentos (já em home/estimates) |

Ownership e Bearer permanecem **só na API** (`UserContextGuard`). O Mobile **não** envia `userId` no body.

## Peças

| Peça | Caminho |
| --- | --- |
| Rotas | `src/app/(tabs)/vehicles/` |
| Feature | `src/features/vehicles/` |
| HTTP | `src/services/api/vehicles.ts` |
| Contrato | [api-contracts-and-data-strategy.md](https://github.com/EngJao89/autotrack-api/blob/master/docs/api-contracts-and-data-strategy.md) §5.3 |

### Campos

- **Obrigatórios:** `brand`, `model`, `year` (`1900` … `anoAtual + 1`)
- **Opcionais:** `version`, `licensePlate` (máx. 10, uppercase), `color`, `fuelType` (lowercase), `odometerKm` (inteiro ≥ 0)

### Invalidação de cache

Sem TanStack Query neste corte: `useFocusEffect` recarrega a lista/detalhe; create/update/delete navegam de volta e o foco dispara novo fetch. A Home (`DashboardScreen`) também refetch no foco e após criar veículo no sheet.

## Critérios de aceite

- [x] Listar / criar / detalhar / editar / excluir veículos via Bearer real
- [x] Estados loading / empty / error + nova tentativa
- [x] Validação de ano e km; placa normalizada sem inventar unicidade
- [x] Home reutiliza `CreateVehicleForm` de `@/features/vehicles`
- [x] Docs + testes de `plate` / `validation`
- [ ] Revisão humana no PR

## Relacionados

- MVP J4: [mvp-scope.md](./mvp-scope.md)
- Arquitetura feature-first: [architecture.md](./architecture.md)
- Fronteira API: [api-mobile-boundary.md](https://github.com/EngJao89/autotrack-api/blob/master/docs/api-mobile-boundary.md)
