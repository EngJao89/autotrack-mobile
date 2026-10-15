/**
 * Public API of the auth feature.
 * External modules must import only from `@/features/auth`.
 * Inside this feature, prefer relative imports to avoid cycles via this barrel.
 */

export { AuthGate } from './AuthGate';
export { AuthProvider, useAuth, type AuthStatus } from './AuthProvider';
export { useGoogleSignIn } from './hooks/useGoogleSignIn';
export { mapFirebaseError } from './mapFirebaseError';
export {
  emailPasswordSchema,
  registerSchema,
  type EmailPasswordForm,
  type RegisterForm,
} from './schemas';
export { LoginScreen } from './screens/LoginScreen';
export { RegisterScreen } from './screens/RegisterScreen';
export { SessionHomeScreen } from './screens/SessionHomeScreen';
export type { AuthCredentials } from './services/session';
export { useSessionStore, type ProfileStatus } from './store/sessionStore';
export type { User, UserProfileUpdate } from './types/user';
