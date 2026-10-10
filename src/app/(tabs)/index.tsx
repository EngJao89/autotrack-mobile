import { View } from 'react-native';

import { Badge, Button, Card, Screen, Text } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useAppTheme } from '@/theme';

export default function HomeScreen() {
  const theme = useAppTheme();
  const { profile, firebaseUser, isMockProfile, signOut, getAccessToken } = useAuth();

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing[24] }}>
        <View style={{ gap: theme.spacing[8] }}>
          <Text variant="title">AutoTrack</Text>
          <Text variant="body" color="secondary">
            Sessão autenticada via Firebase. O perfil local vem da autotrack-api (ou mock).
          </Text>
        </View>

        <Card elevated>
          <View style={{ gap: theme.spacing[12] }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: theme.spacing[8],
              }}
            >
              <Text variant="subtitle">Perfil</Text>
              {isMockProfile ? (
                <Badge label="Mock API" tone="warning" />
              ) : (
                <Badge label="API" tone="success" />
              )}
            </View>

            <Text variant="label">E-mail</Text>
            <Text variant="body">{profile?.email || firebaseUser?.email || '—'}</Text>

            <Text variant="label">Nome</Text>
            <Text variant="body">{profile?.name || firebaseUser?.displayName || '—'}</Text>

            <Text variant="label">firebaseUid</Text>
            <Text variant="caption" color="secondary">
              {profile?.firebaseUid || firebaseUser?.uid || '—'}
            </Text>

            <Text variant="caption" color="secondary">
              Identidade estável: firebaseUid. E-mail é dado do provedor e não autoriza sozinho.
            </Text>
          </View>
        </Card>

        <View style={{ gap: theme.spacing[12] }}>
          <Button
            label="Copiar ID Token (dev)"
            variant="secondary"
            onPress={async () => {
              const token = await getAccessToken();
              if (__DEV__) {
                console.log('[auth] Firebase ID Token length:', token?.length ?? 0);
              }
            }}
          />
          <Button label="Sair" variant="destructive" onPress={() => void signOut()} />
        </View>
      </View>
    </Screen>
  );
}
