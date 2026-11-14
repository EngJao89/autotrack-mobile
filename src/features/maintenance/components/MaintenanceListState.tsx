import { View } from 'react-native';

import { Button, Card, Loading, Text } from '@/components/ui';
import { useAppTheme } from '@/theme';

type MaintenanceListStateProps =
  { kind: 'loading' } | { kind: 'empty' } | { kind: 'error'; message: string; onRetry: () => void };

export function MaintenanceListState(props: MaintenanceListStateProps) {
  const theme = useAppTheme();

  if (props.kind === 'loading') {
    return <Loading label="Carregando manutenções…" />;
  }

  if (props.kind === 'empty') {
    return (
      <Card>
        <View style={{ gap: theme.spacing[12] }}>
          <Text variant="subtitle">Nenhuma manutenção realizada</Text>
          <Text variant="body" color="secondary">
            Quando um reparo for concluído no dashboard, ele aparece aqui no histórico.
          </Text>
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
