import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';

import { getFirebaseSetupMessage, isFirebaseConfigured } from '@/config/env';
import { Button, Card, Screen, Text, TextInput } from '@/components/ui';
import {
  emailPasswordSchema,
  mapFirebaseError,
  useAuth,
  useGoogleSignIn,
  type EmailPasswordForm,
} from '@/features/auth';
import { useAppTheme } from '@/theme';

export default function LoginScreen() {
  const theme = useAppTheme();
  const { signIn, error, clearError, status } = useAuth();
  const google = useGoogleSignIn();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const firebaseReady = isFirebaseConfigured();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailPasswordForm>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setLocalError(null);
    clearError();

    if (!firebaseReady) {
      setLocalError(getFirebaseSetupMessage());
      return;
    }

    setSubmitting(true);
    try {
      await signIn(values);
    } catch (err) {
      setLocalError(mapFirebaseError(err));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen scroll>
      <View style={{ gap: theme.spacing[24], paddingTop: theme.spacing[24] }}>
        <View style={{ gap: theme.spacing[8] }}>
          <Text variant="title">AutoTrack</Text>
          <Text variant="body" color="secondary">
            Entre com Firebase (e-mail/senha ou Google). A API recebe apenas o ID Token.
          </Text>
        </View>

        {!firebaseReady || status === 'unconfigured' ? (
          <Card>
            <Text variant="body" color="warning">
              {getFirebaseSetupMessage()}
            </Text>
          </Card>
        ) : null}

        <Card>
          <View style={{ gap: theme.spacing[16] }}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="E-mail"
                  placeholder="voce@email.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.email?.message}
                  required
                  disabled={submitting}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Senha"
                  placeholder="••••••••"
                  secureTextEntry
                  autoComplete="password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.password?.message}
                  required
                  disabled={submitting}
                />
              )}
            />

            {localError || error || google.error ? (
              <Text variant="bodySmall" color="error">
                {localError || error || google.error}
              </Text>
            ) : null}

            <Button
              label="Entrar"
              onPress={onSubmit}
              loading={submitting}
              disabled={!firebaseReady || submitting}
            />

            <Button
              label="Continuar com Google"
              variant="secondary"
              onPress={google.promptGoogleSignIn}
              loading={google.pending}
              disabled={!firebaseReady || !google.ready || submitting}
            />

            <Text variant="caption" color="secondary">
              {google.hint}
            </Text>
          </View>
        </Card>

        <Text variant="bodySmall" color="secondary">
          Não tem conta?{' '}
          <Link href="/(auth)/register">
            <Text variant="bodySmall" color="brand" weight="semibold">
              Criar conta
            </Text>
          </Link>
        </Text>
      </View>
    </Screen>
  );
}
