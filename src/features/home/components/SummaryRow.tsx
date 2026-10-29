import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { useAppTheme } from '@/theme';

import { KANBAN_COLUMNS, type KanbanCounts } from '../lib/kanban';

type SummaryRowProps = {
  counts: KanbanCounts;
};

export function SummaryRow({ counts }: SummaryRowProps) {
  const theme = useAppTheme();

  return (
    <View style={{ flexDirection: 'row', gap: theme.spacing[8] }}>
      {KANBAN_COLUMNS.map((column) => (
        <Card key={column.status} style={{ flex: 1, padding: theme.spacing[12] }}>
          <Text variant="caption" color="secondary">
            {column.label}
          </Text>
          <Text variant="title" accessibilityLabel={`${column.label}: ${counts[column.status]}`}>
            {counts[column.status]}
          </Text>
        </Card>
      ))}
    </View>
  );
}
