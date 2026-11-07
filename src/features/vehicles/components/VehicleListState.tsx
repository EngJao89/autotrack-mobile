import { View } from 'react-native';

import { Button, Card, Loading, Text } from '@/components/ui';
import { useAppTheme } from '@/theme';

type VehicleListStateProps =
  | { kind: 'loading' }
  | { kind: 'empty'; onCreate: () => void }
  | { kind: 'error'; message: string; onRetry: () => void };

export function VehicleListState(props: VehicleListStateProps) {
  const theme = useAppTheme();

  if (props.kind === 'loading') {
    return <Loading label="Carregando veículos…" />;
  }

  if (props.kind === 'empty') {
    return (
      <Card>
        <View style={{ gap: theme.spacing[12] }}>
          <Text variant="subtitle">Nenhum veículo</Text>
          <Text variant="body" color="secondary">
            Cadastre um veículo próprio para acompanhar reparos e orçamentos.
          </Text>
          <Button label="Cadastrar veículo" onPress={props.onCreate} />
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <View style={{ gap: theme.spacing[12] }}>
        <Text variant="body" color="secondary" accessibilityLiveRegion="polite">
          {props.message}
        </Text>
        <Button label="Tentar novamente" onPress={props.onRetry} />
      </View>
    </Card>
  );
}
