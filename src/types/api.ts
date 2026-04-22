/** User identity injected by withAuth middleware */
export interface AuthUser {
  uid: string;
  email: string | undefined;
}

/** Serializable subset of Firebase User for Redux store */
export interface SerializedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export interface ApiErrorResponse {
  error: string;
  message?: string;
}
