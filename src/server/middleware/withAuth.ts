import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { AppError } from '@/server/errors/AppError';
import type { AuthUser, ApiErrorResponse } from '@/types/api';

type AuthenticatedHandler = (req: Request, ctx: unknown, user: AuthUser) => Promise<Response>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: Request, ctx: unknown): Promise<Response> => {
    const authorization = req.headers.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json<ApiErrorResponse>(
        { error: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' },
        { status: 401 },
      );
    }

    const token = authorization.slice(7);

    try {
      const decoded = await adminAuth.verifyIdToken(token, true);
      const user: AuthUser = { uid: decoded.uid, email: decoded.email };
      return handler(req, ctx, user);
    } catch {
      throw new AppError('Invalid or expired token', 'UNAUTHORIZED', 401);
    }
  };
}
