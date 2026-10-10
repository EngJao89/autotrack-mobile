import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';

import { isFirebaseConfigured } from '@/config/env';
import { Button, Card, Screen, Text, TextInput } from '@/components/ui';
import { registerSchema, useAuth, type RegisterForm } from '@/features/auth';
import { useAppTheme } from '@/theme';

export default function RegisterScreen() {
  const theme = useAppTheme();
  const { register, error, clearError } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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
    setSubmitting(true);
    try {
      await register({ email: values.email, password: values.password });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Não foi possível criar a conta');
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
              disabled={!isFirebaseConfigured()}
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
