const errorMessages: Record<string, string> = {
  // Login
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  // Register
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/invalid-email': 'Invalid email address.',
  // Google
  'auth/popup-closed-by-user': 'Sign-in popup was closed.',
  'auth/cancelled-popup-request': 'Sign-in was cancelled.',
  'auth/popup-blocked': 'Sign-in popup was blocked by the browser.',
};

export function firebaseErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof Error && 'code' in error) {
    const code = (error as { code: string }).code;
    return errorMessages[code] ?? fallback;
  }
  return fallback;
}
