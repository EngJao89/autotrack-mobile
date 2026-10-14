/**
 * Shape validation for Firebase Web client config (EXPO_PUBLIC_*).
 * Never log raw values — only booleans / field names.
 */

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export type FirebaseConfigIssue = {
  field: keyof FirebaseClientConfig | 'firebase';
  code: string;
  message: string;
};

const PLACEHOLDERS = new Set(['', 'api-key', 'your-api-key', 'changeme', 'todo', 'xxx', 'xxxxx']);

function normalize(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

export function looksLikePrivateKey(value: string): boolean {
  const v = value.trim();
  return (
    v.includes('BEGIN PRIVATE KEY') ||
    v.includes('BEGIN RSA PRIVATE KEY') ||
    v.includes('BEGIN CERTIFICATE') ||
    (v.includes('BEGIN') && v.includes('PRIVATE'))
  );
}

export function looksLikeWebApiKey(value: string): boolean {
  // Firebase / Google browser API keys typically start with AIza and are ~39 chars.
  return /^AIza[0-9A-Za-z_-]{20,}$/.test(value.trim());
}

export function validateFirebaseClientConfig(
  input: Partial<Record<keyof FirebaseClientConfig, string | undefined>>
): FirebaseConfigIssue[] {
  const issues: FirebaseConfigIssue[] = [];
  const apiKey = normalize(input.apiKey ?? '');
  const authDomain = normalize(input.authDomain ?? '');
  const projectId = normalize(input.projectId ?? '');
  const appId = normalize(input.appId ?? '');
  const messagingSenderId = normalize(input.messagingSenderId ?? '');
  const storageBucket = normalize(input.storageBucket ?? '');

  if (!apiKey || PLACEHOLDERS.has(apiKey.toLowerCase())) {
    issues.push({
      field: 'apiKey',
      code: 'missing_api_key',
      message:
        'EXPO_PUBLIC_FIREBASE_API_KEY está vazia. Copie o apiKey do app Web em Project settings.',
    });
  } else if (looksLikePrivateKey(apiKey)) {
    issues.push({
      field: 'apiKey',
      code: 'private_key_in_client',
      message:
        'EXPO_PUBLIC_FIREBASE_API_KEY parece uma chave privada. Remova-a do .env, use só o apiKey do app Web (começa com AIza) e revogue a chave privada se ela vazou.',
    });
  } else if (!looksLikeWebApiKey(apiKey) || apiKey.length > 80 || /\s/.test(apiKey)) {
    issues.push({
      field: 'apiKey',
      code: 'invalid_api_key_shape',
      message:
        'EXPO_PUBLIC_FIREBASE_API_KEY inválida. Use o apiKey do firebaseConfig do app Web (começa com AIza), sem aspas e sem espaços.',
    });
  }

  if (!authDomain) {
    issues.push({
      field: 'authDomain',
      code: 'missing_auth_domain',
      message: 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN está vazia.',
    });
  } else if (!authDomain.endsWith('.firebaseapp.com') && !authDomain.endsWith('.web.app')) {
    issues.push({
      field: 'authDomain',
      code: 'invalid_auth_domain',
      message:
        'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN deve ser algo como seu-projeto.firebaseapp.com (campo authDomain do app Web).',
    });
  }

  if (!projectId) {
    issues.push({
      field: 'projectId',
      code: 'missing_project_id',
      message: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID está vazia.',
    });
  }

  if (!appId) {
    issues.push({
      field: 'appId',
      code: 'missing_app_id',
      message: 'EXPO_PUBLIC_FIREBASE_APP_ID está vazia.',
    });
  } else if (!/^1:\d+:web:[a-f0-9]+$/i.test(appId)) {
    issues.push({
      field: 'appId',
      code: 'invalid_app_id',
      message:
        'EXPO_PUBLIC_FIREBASE_APP_ID deve ser o appId do app Web (formato 1:…:web:…). Não use o App ID de iOS/Android nativo.',
    });
  }

  if (!messagingSenderId) {
    issues.push({
      field: 'messagingSenderId',
      code: 'missing_messaging_sender_id',
      message: 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID está vazia.',
    });
  } else if (!/^\d+$/.test(messagingSenderId)) {
    issues.push({
      field: 'messagingSenderId',
      code: 'invalid_messaging_sender_id',
      message: 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID deve ser numérico.',
    });
  }

  // storageBucket is optional for Auth-only, but warn if wildly wrong when present
  if (storageBucket && !storageBucket.includes('.')) {
    issues.push({
      field: 'storageBucket',
      code: 'invalid_storage_bucket',
      message:
        'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET parece inválido (ex.: seu-projeto.appspot.com).',
    });
  }

  return issues;
}

export function getFirebaseConfigErrorMessage(issues: FirebaseConfigIssue[]): string {
  if (issues.length === 0) return '';
  return issues[0]?.message ?? 'Configuração Firebase inválida.';
}
