import { useState } from 'react';
import { View } from 'react-native';

import { Badge, Button, Card, Screen, Text } from '@/components/ui';
import { useAppTheme } from '@/theme';

import { useAuth } from '../AuthProvider';
import { useSessionStore } from '../store/sessionStore';

/**
 * Temporary home while domain features (profile/vehicles) are not implemented.
 * PoC (ATP-3 / ATP-36): Firebase session stays active even if profile bootstrap fails;
 * retry never re-creates the Firebase user.
 */
export function SessionHomeScreen() {
  const theme = useAppTheme();
  const {
    profile,
    profileStatus,
    profileError,
    firebaseUser,
    isMockProfile,
    selectedVehicleId,
    signOut,
    refreshProfile,
    getAccessToken,
  } = useAuth();

  const setSelectedVehicleId = useSessionStore((s) => s.setSelectedVehicleId);
  const [retryingProfile, setRetryingProfile] = useState(false);

  const statusLabel =
    profileStatus === 'loading'
      ? 'Carregando perfil…'
      : profileStatus === 'error'
        ? 'Erro no perfil'
        : profileStatus === 'ready'
          ? 'Perfil pronto'
          : 'Perfil ocioso';

  const onRetryProfile = async () => {
    if (retryingProfile) return;
    setRetryingProfile(true);
    try {
      await refreshProfile();
    } finally {
      setRetryingProfile(false);
    }
  };

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing[24] }}>
        <View style={{ gap: theme.spacing[8] }}>
          <Text variant="title">AutoTrack</Text>
          <Text variant="body" color="secondary">
            Sessão Firebase no AuthProvider; perfil e seleção local no Zustand (limpos no logout).
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
              <Text variant="subtitle">Sessão</Text>
              <Badge label="Firebase ativo" tone="success" />
            </View>

            <Text variant="caption" color="secondary">
              Falha no bootstrap da API não encerra o login. Use “Tentar sincronizar perfil” — isso
              não cadastra o usuário de novo no Firebase.
            </Text>
          </View>
        </Card>

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
              <View style={{ flexDirection: 'row', gap: theme.spacing[8], flexWrap: 'wrap' }}>
                <Badge
                  label={statusLabel}
                  tone={
                    profileStatus === 'error'
                      ? 'error'
                      : profileStatus === 'ready'
                        ? 'success'
                        : 'neutral'
                  }
                />
                {profileStatus === 'ready' ? (
                  isMockProfile ? (
                    <Badge label="Mock API" tone="warning" />
                  ) : (
                    <Badge label="API" tone="success" />
                  )
                ) : null}
              </View>
            </View>

            {profileStatus === 'error' ? (
              <Text variant="body" color="secondary" accessibilityLiveRegion="polite">
                {profileError ?? 'Falha ao sincronizar perfil. A sessão Firebase permanece ativa.'}
              </Text>
            ) : null}

            {profileStatus === 'loading' ? (
              <Text variant="body" color="secondary">
                Sincronizando perfil com a API…
              </Text>
            ) : null}

            <Text variant="label">E-mail</Text>
            <Text variant="body">{profile?.email || firebaseUser?.email || '—'}</Text>

            <Text variant="label">Nome</Text>
            <Text variant="body">{profile?.name || firebaseUser?.displayName || '—'}</Text>

            <Text variant="label">firebaseUid</Text>
            <Text variant="caption" color="secondary">
              {profile?.firebaseUid || firebaseUser?.uid || '—'}
            </Text>

            <Text variant="label">Veículo selecionado (PoC)</Text>
            <Text variant="body">{selectedVehicleId ?? 'nenhum'}</Text>

            <Text variant="caption" color="secondary">
              Identidade estável: firebaseUid. Tokens não entram no store. Logout limpa perfil e
              veículo selecionado.
            </Text>
          </View>
        </Card>

        <View style={{ gap: theme.spacing[12] }}>
          <Button
            label="Selecionar veículo demo"
            variant="secondary"
            onPress={() => setSelectedVehicleId('vehicle-poc-1')}
          />
          <Button
            label="Tentar sincronizar perfil"
            variant="secondary"
            onPress={() => void onRetryProfile()}
            loading={retryingProfile || profileStatus === 'loading'}
            disabled={retryingProfile || profileStatus === 'loading'}
          />
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
