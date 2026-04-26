import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '@/server/errors/AppError';
import { logger } from '@/lib/logger';
import type { ApiErrorResponse } from '@/types/api';

type RouteHandler<TCtx = unknown> = (req: Request, ctx: TCtx) => Promise<Response>;

export function withErrorHandler<TCtx = unknown>(handler: RouteHandler<TCtx>): RouteHandler<TCtx> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json<ApiErrorResponse>(
          { error: error.code, message: error.message },
          { status: error.status },
        );
      }

      if (error instanceof ZodError) {
        return NextResponse.json<ApiErrorResponse>(
          { error: 'VALIDATION', details: error.flatten() },
          { status: 400 },
        );
      }

      logger.error('Unhandled API error', {
        error:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : { value: String(error) },
      });
      return NextResponse.json<ApiErrorResponse>(
        { error: 'INTERNAL', message: 'Internal server error' },
        { status: 500 },
      );
    }
  };
}
