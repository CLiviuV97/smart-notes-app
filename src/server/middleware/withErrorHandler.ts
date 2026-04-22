import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '@/server/errors/AppError';
import type { ApiErrorResponse } from '@/types/api';

type RouteHandler = (req: Request, ctx: unknown) => Promise<Response>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
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
          { error: 'VALIDATION_ERROR', message: error.message },
          { status: 400 },
        );
      }

      console.error('Unhandled error:', error);
      return NextResponse.json<ApiErrorResponse>(
        { error: 'INTERNAL', message: 'Internal server error' },
        { status: 500 },
      );
    }
  };
}
