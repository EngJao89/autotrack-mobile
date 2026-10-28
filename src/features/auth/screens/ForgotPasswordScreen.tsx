import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';

import { getFirebaseSetupMessage, isFirebaseConfigured } from '@/config/env';
import { Button, Card, Screen, Text, TextInput } from '@/components/ui';
import { useAppTheme } from '@/theme';

import { mapFirebaseError } from '../mapFirebaseError';
import { forgotPasswordSchema, type ForgotPasswordForm } from '../schemas';
import { requestPasswordReset } from '../services/session';

export function ForgotPasswordScreen() {
  const theme = useAppTheme();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const firebaseReady = isFirebaseConfigured();

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (submitting) return;

    setLocalError(null);

    if (!firebaseReady) {
      setLocalError(getFirebaseSetupMessage());
      return;
    }

    setSubmitting(true);
    try {
      await requestPasswordReset(values.email);
      setSent(true);
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
          <Text variant="title">Recuperar acesso</Text>
          <Text variant="body" color="secondary">
            Enviaremos um link de redefinição de senha pelo Firebase Authentication. A autotrack-api
            não recebe nem armazena senhas.
          </Text>
        </View>

        {!firebaseReady ? (
          <Card>
            <Text variant="body" color="warning">
              {getFirebaseSetupMessage()}
            </Text>
          </Card>
        ) : null}

        {sent ? (
          <Card>
            <View style={{ gap: theme.spacing[16] }}>
              <Text variant="subtitle">Verifique seu e-mail</Text>
              <Text variant="body" color="secondary" accessibilityLiveRegion="polite">
                Se existir uma conta com{' '}
                <Text variant="body" weight="semibold">
                  {getValues('email').trim()}
                </Text>
                , enviamos as instruções para redefinir a senha. Confira também a pasta de spam.
              </Text>
              <Button
                label="Enviar novamente"
                variant="secondary"
                onPress={() => void onSubmit()}
                disabled={!firebaseReady || submitting}
                loading={submitting}
              />
              <Button
                label="Usar outro e-mail"
                variant="ghost"
                onPress={() => {
                  setSent(false);
                  setLocalError(null);
                }}
                disabled={submitting}
              />
            </View>
          </Card>
        ) : (
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

              {localError ? (
                <Text variant="bodySmall" color="error">
                  {localError}
                </Text>
              ) : null}

              <Button
                label="Enviar link"
                onPress={onSubmit}
                loading={submitting}
                disabled={!firebaseReady || submitting}
              />
            </View>
          </Card>
        )}

        <Text variant="bodySmall" color="secondary">
          Lembrou a senha?{' '}
          <Link href="/(auth)/login">
            <Text variant="bodySmall" color="brand" weight="semibold">
              Voltar ao login
            </Text>
          </Link>
        </Text>
      </View>
    </Screen>
  );
}
