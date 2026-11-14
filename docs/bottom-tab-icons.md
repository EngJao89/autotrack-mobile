# Ícones do bottom tab (ATP-45)

Corrige ícones genéricos/repetidos (`explore.png` em várias abas) por glifos semânticos alinhados a cada destino.

Card Notion: [Corrigir ícones do bottom tab conforme a tela de destino](https://app.notion.com/p/Corrigir-cones-do-bottom-tab-conforme-a-tela-de-destino-414e535b5fd6815992f3cfd65ca1cce0)

## Mapeamento tela / rota → ícone

| Rota Expo Router | Rótulo | SF Symbol (iOS) | Material Symbol (Android `md`) |
| --- | --- | --- | --- |
| `index` | Home | `house` / `house.fill` | `home` / `home_filled` |
| `vehicles` | Veículos | `car` / `car.fill` | `directions_car` / `directions_car_filled` |
| `maintenances` | Manutenções | `wrench.and.screwdriver` / `.fill` | `build` |
| `design-system` | UI Kit | `paintpalette` / `paintpalette.fill` | `palette` |

Fonte de verdade no código: `src/components/navigation/tabIcons.ts` (consumido por `src/components/app-tabs.tsx`).

## Decisões

- Biblioteca já instalada via Expo Router Native Tabs (`sf` + `md`) — **sem** nova dependência e **sem** PNGs novos.
- Ordem, rotas e rótulos das abas **não** mudam.
- Seleção continua por tint/estado nativo; onde o Material não tem variante filled distinta (`build`, `palette`), o mesmo glifo é tingido no estado ativo.
- Web (`app-tabs.web.tsx`) permanece com rótulos textuais (barra custom do starter); o problema reportado era a tab nativa com três `explore` iguais.
- Coordenado com ATP-46: Manutenções usa ferramenta (`build` / wrench), não o fallback genérico.

## Fora de escopo

Redesign da barra, novas telas, troca de endpoints, ícones custom desenhados, instalação de biblioteca só para ícones.
