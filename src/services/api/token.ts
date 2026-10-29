import { isFirebaseConfigured } from '@/config/env';
import { getFirebaseAuth } from '@/services/firebase';

/**
 * Reads the current Firebase ID Token at request time.
 * Never caches tokens in domain stores; never logs the token value.
 */
export async function getCurrentIdToken(forceRefresh = false): Promise<string | null> {
  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    const user = getFirebaseAuth().currentUser;
    if (!user) {
      return null;
    }
    return await user.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}
