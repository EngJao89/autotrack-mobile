import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';

import { getFirebaseSetupMessage, isFirebaseConfigured } from '@/config/env';
import { Button, Card, Text, TextInput } from '@/components/ui';
import { useAppTheme } from '@/theme';

import { AuthScreenShell } from '../components/AuthScreenShell';
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
    <AuthScreenShell
      title={sent ? 'Verifique seu e-mail' : 'Recuperar senha'}
      subtitle={
        sent
          ? 'Se existir uma conta com esse e-mail, enviamos as instruções para redefinir a senha.'
          : 'Informe o e-mail da sua conta. Enviaremos um link para criar uma nova senha.'
      }
      footer={
        <Text variant="bodySmall" color="secondary">
          Lembrou a senha?{' '}
          <Link href="/(auth)/login">
            <Text variant="bodySmall" color="brand" weight="semibold">
              Voltar ao login
            </Text>
          </Link>
        </Text>
      }
    >
      {!firebaseReady ? (
        <Card>
          <Text variant="body" color="warning">
            {getFirebaseSetupMessage()}
          </Text>
        </Card>
      ) : null}

      {sent ? (
        <Card elevated>
          <View style={{ gap: theme.spacing[20] }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: theme.radii.full,
                backgroundColor: theme.colors.feedback.success,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="mail-outline" size={24} color={theme.colors.text.inverse} />
            </View>

            <Text variant="body" color="secondary" accessibilityLiveRegion="polite">
              Enviado para{' '}
              <Text variant="body" weight="semibold">
                {getValues('email').trim()}
              </Text>
              . Confira também a pasta de spam.
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
        <Card elevated>
          <View style={{ gap: theme.spacing[20] }}>
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
                  textContentType="emailAddress"
                  returnKeyType="send"
                  onSubmitEditing={() => void onSubmit()}
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
              <Text variant="bodySmall" color="error" accessibilityLiveRegion="polite">
                {localError}
              </Text>
            ) : null}

            <Button
              label="Enviar link"
              onPress={() => void onSubmit()}
              loading={submitting}
              disabled={!firebaseReady || submitting}
            />
          </View>
        </Card>
      )}
    </AuthScreenShell>
  );
}
