import { withErrorHandler } from './withErrorHandler';
import { withAuth, type AuthenticatedHandler, type WithAuthOptions } from './withAuth';

export function protectedRoute<TCtx = unknown>(
  handler: AuthenticatedHandler<TCtx>,
  options?: WithAuthOptions,
) {
  return withErrorHandler(withAuth(handler, options));
}
