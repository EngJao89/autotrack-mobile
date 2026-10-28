/**
 * Maps Firebase Auth errors to user-facing Portuguese messages.
 * Never includes credentials, tokens, or raw config values.
 */

export function mapFirebaseError(error: unknown): string {
  const code = extractCode(error);
  const fallback =
    error instanceof Error && error.message
      ? sanitizeTechnicalMessage(error.message)
      : 'Não foi possível concluir a autenticação.';

  switch (code) {
    case 'auth/api-key-not-valid':
    case 'auth/invalid-api-key':
      return 'Configuração do Firebase inválida (API key). Verifique EXPO_PUBLIC_FIREBASE_API_KEY no .env — use o apiKey do app Web (começa com AIza) e reinicie o Expo.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado. Tente entrar ou use outro e-mail.';
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/weak-password':
      return 'Senha fraca. Use pelo menos 6 caracteres (recomendado: 8+).';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
    case 'auth/network-request-failed':
      return 'Falha de rede. Verifique a conexão e tente novamente.';
    case 'auth/operation-not-allowed':
      return 'Login por e-mail/senha não está habilitado no Firebase Console (Authentication → Sign-in method).';
    case 'auth/configuration-not-found':
      return 'Autenticação Firebase não configurada neste projeto. Em Authentication → Sign-in method, ative E-mail/senha (e Google, se for usar) e salve. Depois reinicie o Expo.';
    case 'auth/user-disabled':
      return 'Esta conta foi desabilitada.';
    case 'auth/missing-email':
      return 'Informe um e-mail para continuar.';
    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return 'Link de recuperação inválido ou expirado. Solicite um novo e-mail.';
    default:
      return fallback;
  }
}

function extractCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === 'string') {
      // Firebase sometimes returns "auth/api-key-not-valid.-please-pass-a-valid-api-key."
      if (code.includes('api-key-not-valid') || code.includes('invalid-api-key')) {
        return 'auth/api-key-not-valid';
      }
      return code;
    }
  }

  if (error instanceof Error) {
    const match = error.message.match(/auth\/[a-z0-9-]+/i);
    if (match?.[0]) {
      const code = match[0].toLowerCase();
      if (code.includes('api-key-not-valid') || code.includes('invalid-api-key')) {
        return 'auth/api-key-not-valid';
      }
      return code;
    }
  }

  return '';
}

function sanitizeTechnicalMessage(message: string): string {
  // Avoid showing PEM / long secrets if they leak into Error.message
  if (message.includes('BEGIN') || message.length > 220) {
    return 'Erro de autenticação. Verifique a configuração Firebase e tente novamente.';
  }
  return (
    message.replace(/^Firebase:\s*/i, '').trim() || 'Não foi possível concluir a autenticação.'
  );
}
