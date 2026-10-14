import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';

import { getFirebaseSetupMessage, isFirebaseConfigured } from '@/config/env';
import { Button, Card, Screen, Text, TextInput } from '@/components/ui';
import { useAppTheme } from '@/theme';

import { useAuth } from '../AuthProvider';
import { mapFirebaseError } from '../mapFirebaseError';
import { registerSchema, type RegisterForm } from '../schemas';

export function RegisterScreen() {
  const theme = useAppTheme();
  const { register, error, clearError } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const firebaseReady = isFirebaseConfigured();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
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
      // Only email+password go to Firebase Auth — never to autotrack-api.
      await register({ email: values.email, password: values.password });
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
          <Text variant="title">Criar conta</Text>
          <Text variant="body" color="secondary">
            O cadastro usa Firebase Authentication. A senha nunca é enviada à autotrack-api.
          </Text>
        </View>

        {!firebaseReady ? (
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
                  placeholder="mínimo 8 caracteres"
                  secureTextEntry
                  autoComplete="new-password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.password?.message}
                  required
                  disabled={submitting}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Confirmar senha"
                  placeholder="repita a senha"
                  secureTextEntry
                  autoComplete="new-password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  errorText={errors.confirmPassword?.message}
                  required
                  disabled={submitting}
                />
              )}
            />

            {localError || error ? (
              <Text variant="bodySmall" color="error">
                {localError || error}
              </Text>
            ) : null}

            <Button
              label="Criar conta"
              onPress={onSubmit}
              loading={submitting}
              disabled={!firebaseReady || submitting}
            />
          </View>
        </Card>

        <Text variant="bodySmall" color="secondary">
          Já tem conta?{' '}
          <Link href="/(auth)/login">
            <Text variant="bodySmall" color="brand" weight="semibold">
              Entrar
            </Text>
          </Link>
        </Text>
      </View>
    </Screen>
  );
}
