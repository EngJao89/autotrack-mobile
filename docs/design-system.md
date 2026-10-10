# Design System — AutoTrack Mobile

Base visual tipada para as telas iniciais do produto (ATP-8). Tokens e primitivos ficam independentes de features de negócio.

## Princípios

- **Consistência** — mesma intenção visual, mesma experiência.
- **Acessibilidade** — contraste, área de toque mínima, labels e estados.
- **Composição** — telas montadas com primitivos pequenos e previsíveis.
- **Semântica** — tokens descrevem intenção (`colors.text.primary`), não valor bruto.
- **Evolução incremental** — começar pelo essencial e expandir com fluxos reais.
- **Compatibilidade mobile** — validar Android e iOS.

## Uso rápido

```tsx
import { AppThemeProvider, useAppTheme } from '@/theme';
import { Button, Screen, Text, TextInput } from '@/components/ui';

export function Example() {
  const theme = useAppTheme();

  return (
    <Screen scroll>
      <Text variant="title">Olá</Text>
      <TextInput label="E-mail" placeholder="voce@autotrack.app" />
      <Button label="Continuar" onPress={() => undefined} />
      {/* use theme.spacing / theme.colors — evite valores arbitrários */}
    </Screen>
  );
}
```

O `AppThemeProvider` já envolve o app em `src/app/_layout.tsx`.

## Tokens

Centralizados em `src/theme/`:

| Arquivo | Responsabilidade |
| --- | --- |
| `types.ts` | Contratos TypeScript do tema |
| `tokens.ts` | Escalas compartilhadas (spacing, tipografia, radii, elevation, layout, opacity) |
| `light.ts` / `dark.ts` | Paletas semânticas |
| `ThemeProvider.tsx` | Context + hooks `useAppTheme` / `useThemeMode` |

### Cores semânticas

`brand.primary|secondary`, `background.canvas|surface`, `text.primary|secondary|inverse`, `border.default`, `feedback.success|warning|error|info`.

### Escalas

- **spacing:** `0, 4, 8, 12, 16, 20, 24, 32, 40, 48`
- **fontSize / lineHeight:** `xs, sm, md, lg, xl, 2xl`
- **fontWeight:** `regular, medium, semibold, bold`
- **radii:** `none, sm, md, lg, full`
- **elevation:** `none, sm, md, lg`
- **layout:** `screenPadding`, `controlHeight`, `iconSize`, `touchTargetMin` (44)

Evite cores e medidas arbitrárias em componentes/telas. Exceções recorrentes devem virar tokens.

## Tema e dark mode

- Temas **light** e **dark** estão implementados.
- O provider segue a preferência do sistema por padrão.
- Persistência de preferência manual (settings) fica para uma tarefa futura; até lá, use a prop `mode` do `AppThemeProvider` se precisar forçar um tema em runtime.

## Componentes

Importação: `@/components/ui`.

| Componente | Responsabilidade |
| --- | --- |
| `Screen` | Safe area, fundo canvas, padding e scroll opcional |
| `Text` | Variantes tipográficas e cores semânticas |
| `Button` | `primary`, `secondary`, `ghost`, `destructive` + `disabled` / `loading` |
| `TextInput` | Label, helper, erro, required, disabled |
| `Card` | Surface com borda ou elevação |
| `IconButton` | Toque mínimo + `accessibilityLabel` obrigatório |
| `Divider` | Separação com token de borda |
| `Badge` | Tons semânticos para textos curtos |
| `Avatar` | Imagem ou iniciais |
| `Loading` | Indicador local ou full-screen |

Props tipadas, defaults coerentes e sem vazar detalhes de libs de terceiros.

## Ícones

Biblioteca padrão: **`@expo/vector-icons`** (Ionicons via `IconButton`).

Motivo: já alinhada ao ecossistema Expo, cobertura ampla em iOS/Android/web e tipagem do glyph map.

## Fontes

Fonte de sistema (`System` / `Roboto` / `system-ui`) nesta fase. Branding tipográfico definitivo pode ser refinado depois sem quebrar a API dos tokens.

## Elevação

Sombras iOS (`shadow*`) + `elevation` Android nos tokens `elevation.sm|md|lg`. Preferir `Card` com `elevated` em vez de sombra manual.

## Acessibilidade

- Contraste tipográfico e de feedback via paleta semântica.
- Controles interativos respeitam `layout.touchTargetMin` (44).
- `Button` / `IconButton`: `accessibilityRole`, `accessibilityLabel`, `accessibilityState`.
- Erros de formulário: texto de erro associado ao campo (`errorText` + live region); não depender só da cor da borda.
- Validar wrapping de texto em telas estreitas no catálogo.

## Catálogo de desenvolvimento

Rota: `/design-system` (aba **UI Kit**).

Use para validar tokens, variantes, estados de erro/loading e aparência em Android/iOS/web.

## Testes

Infraestrutura de testes ainda não está configurada neste repositório. Snapshots/referência de `Button` e `TextInput` ficam pendentes até a tarefa de testing.

## Contribuição

1. Novos tokens: tipar em `types.ts`, definir escala em `tokens.ts` (ou paleta em `light`/`dark`) e documentar aqui.
2. Novos primitivos: pasta em `src/components/ui/<Name>/`, export no barrel `index.ts`, exemplo no catálogo.
3. Não criar componentes de domínio (`VehicleCard`, etc.) neste layer.
4. Rodar `npm run lint` e `npm run typecheck` antes do PR.
