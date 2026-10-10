import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import {
  Avatar,
  Badge,
  Button,
  Card,
  Divider,
  IconButton,
  Loading,
  Screen,
  Text,
  TextInput,
} from '@/components/ui';
import { useAppTheme } from '@/theme';

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.spacing[12] }}>
      <Text variant="subtitle">{title}</Text>
      {children}
    </View>
  );
}

export default function DesignSystemPreviewScreen() {
  const theme = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123');

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing[24], paddingBottom: theme.spacing[48] }}>
        <View style={{ gap: theme.spacing[8] }}>
          <Text variant="title">Design System</Text>
          <Text variant="body" color="secondary">
            Catálogo de tokens e primitivos do AutoTrack ({theme.mode}).
          </Text>
        </View>

        <Section title="Tipografia">
          <Card>
            <View style={{ gap: theme.spacing[8] }}>
              <Text variant="title">Title</Text>
              <Text variant="subtitle">Subtitle</Text>
              <Text variant="body">Body — texto principal da interface.</Text>
              <Text variant="bodySmall" color="secondary">
                Body small — apoio e metadados.
              </Text>
              <Text variant="caption" color="secondary">
                Caption
              </Text>
            </View>
          </Card>
        </Section>

        <Section title="Cores semânticas">
          <Card>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[8] }}>
              {(
                [
                  ['brand', theme.colors.brand.primary],
                  ['success', theme.colors.feedback.success],
                  ['warning', theme.colors.feedback.warning],
                  ['error', theme.colors.feedback.error],
                  ['info', theme.colors.feedback.info],
                ] as const
              ).map(([name, color]) => (
                <View
                  key={name}
                  style={{
                    width: 72,
                    height: 56,
                    borderRadius: theme.radii.md,
                    backgroundColor: color,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text variant="caption" color="inverse">
                    {name}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </Section>

        <Section title="Button">
          <Card>
            <View style={{ gap: theme.spacing[12] }}>
              <Button label="Primary" onPress={() => undefined} />
              <Button label="Secondary" variant="secondary" onPress={() => undefined} />
              <Button label="Ghost" variant="ghost" onPress={() => undefined} />
              <Button label="Destructive" variant="destructive" onPress={() => undefined} />
              <Button label="Loading" loading onPress={() => undefined} />
              <Button label="Disabled" disabled onPress={() => undefined} />
            </View>
          </Card>
        </Section>

        <Section title="TextInput">
          <Card>
            <View style={{ gap: theme.spacing[16] }}>
              <TextInput
                label="E-mail"
                placeholder="voce@autotrack.app"
                helperText="Usamos para notificações de manutenção."
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                required
              />
              <TextInput
                label="Senha"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                errorText="A senha deve ter pelo menos 8 caracteres."
              />
              <TextInput label="Placa (desabilitado)" value="ABC1D23" disabled />
            </View>
          </Card>
        </Section>

        <Section title="Card, Badge e Avatar">
          <Card elevated>
            <View style={{ gap: theme.spacing[12] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[12] }}>
                <Avatar name="Ana Souza" />
                <View style={{ flex: 1, gap: theme.spacing[4] }}>
                  <Text variant="label">Ana Souza</Text>
                  <Text variant="caption" color="secondary">
                    Proprietária · 2 veículos
                  </Text>
                </View>
                <Badge label="Ativo" tone="success" />
              </View>
              <Divider />
              <View style={{ flexDirection: 'row', gap: theme.spacing[8], flexWrap: 'wrap' }}>
                <Badge label="Neutro" />
                <Badge label="Atenção" tone="warning" />
                <Badge label="Erro" tone="error" />
                <Badge label="Info" tone="info" />
              </View>
            </View>
          </Card>
        </Section>

        <Section title="IconButton e Loading">
          <Card>
            <View style={{ gap: theme.spacing[16] }}>
              <View style={{ flexDirection: 'row', gap: theme.spacing[8] }}>
                <IconButton
                  icon="notifications-outline"
                  accessibilityLabel="Abrir notificações"
                  onPress={() => undefined}
                />
                <IconButton
                  icon="settings-outline"
                  accessibilityLabel="Abrir configurações"
                  onPress={() => undefined}
                />
                <IconButton
                  icon="trash-outline"
                  accessibilityLabel="Excluir item"
                  disabled
                  onPress={() => undefined}
                />
              </View>
              <Loading label="Carregando dados locais…" />
            </View>
          </Card>
        </Section>
      </View>
    </Screen>
  );
}
