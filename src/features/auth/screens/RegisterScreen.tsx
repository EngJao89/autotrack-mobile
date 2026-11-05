import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';

import { getFirebaseSetupMessage, isFirebaseConfigured } from '@/config/env';
import { Button, Card, Text, TextInput } from '@/components/ui';
import { useAppTheme } from '@/theme';

import { useAuth } from '../AuthProvider';
import { AuthScreenShell } from '../components/AuthScreenShell';
import { mapFirebaseError } from '../mapFirebaseError';
import { registerSchema, type RegisterForm } from '../schemas';

export function RegisterScreen() {
  const theme = useAppTheme();
  const { register, error, clearError } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const firebaseReady = isFirebaseConfigured();
  const formError = localError || error;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (submitting) return;

    setLocalError(null);
    clearError();

    if (!firebaseReady) {
      setLocalError(getFirebaseSetupMessage());
      return;
    }

    setSubmitting(true);
    try {
      await register({ email: values.email, password: values.password });
    } catch (err) {
      setLocalError(mapFirebaseError(err));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <AuthScreenShell
      title="Criar conta"
      subtitle="Comece a organizar as manutenções e o histórico dos seus veículos."
      footer={
        <Text variant="bodySmall" color="secondary">
          Já tem conta?{' '}
          <Link href="/(auth)/login">
            <Text variant="bodySmall" color="brand" weight="semibold">
              Entrar
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
                returnKeyType="next"
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
                textContentType="newPassword"
                returnKeyType="next"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.password?.message}
                helperText="Use no mínimo 8 caracteres."
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
                textContentType="newPassword"
                returnKeyType="go"
                onSubmitEditing={() => void onSubmit()}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                errorText={errors.confirmPassword?.message}
                required
                disabled={submitting}
              />
            )}
          />

          {formError ? (
            <Text variant="bodySmall" color="error" accessibilityLiveRegion="polite">
              {formError}
            </Text>
          ) : null}

          <Button
            label="Criar conta"
            onPress={() => void onSubmit()}
            loading={submitting}
            disabled={!firebaseReady || submitting}
          />
        </View>
      </Card>
    </AuthScreenShell>
  );
}
