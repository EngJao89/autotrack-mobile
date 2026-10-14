/**
 * Local AutoTrack user profile (API model).
 * Identity source of truth is Firebase (`firebaseUid`); the API never stores passwords or tokens.
 */

export type User = {
  id: string;
  firebaseUid: string;
  email: string;
  name: string | null;
  cnh: string | null;
  document: string | null;
  documentType: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  vehicles: unknown[];
};

/** Public create/update payloads must NEVER include firebaseUid. */
export type UserProfileUpdate = {
  name?: string | null;
  cnh?: string | null;
  document?: string | null;
  documentType?: string | null;
  phone?: string | null;
};
