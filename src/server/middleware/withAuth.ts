import { adminAuth } from '@/lib/firebase/admin';
import { AppError } from '@/server/errors/AppError';
import type { AuthUser } from '@/types/api';

export type AuthenticatedHandler<TCtx = unknown> = (
  req: Request,
  ctx: TCtx,
  user: AuthUser,
) => Promise<Response>;

export interface WithAuthOptions {
  checkRevoked?: boolean;
}

export function withAuth<TCtx = unknown>(
  handler: AuthenticatedHandler<TCtx>,
  options?: WithAuthOptions,
) {
  return async (req: Request, ctx: TCtx): Promise<Response> => {
    const authorization = req.headers.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or invalid Authorization header');
    }

    const token = authorization.slice(7);

    try {
      const decoded = await adminAuth.verifyIdToken(token, options?.checkRevoked);
      const user: AuthUser = { uid: decoded.uid, email: decoded.email };
      return handler(req, ctx, user);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.unauthorized('Invalid or expired token');
    }
  };
}
