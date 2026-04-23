import { withErrorHandler } from '../withErrorHandler';
import { AppError } from '@/server/errors/AppError';
import { z } from 'zod';

jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('withErrorHandler', () => {
  it('passes through successful responses', async () => {
    const handler = withErrorHandler(async () => {
      return Response.json({ ok: true });
    });
    const res = await handler(new Request('http://localhost'), {});
    expect(res.status).toBe(200);
  });

  it('handles AppError with correct status and code', async () => {
    const handler = withErrorHandler(async () => {
      throw new AppError('Not found', 'NOT_FOUND', 404);
    });
    const res = await handler(new Request('http://localhost'), {});
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('NOT_FOUND');
    expect(body.message).toBe('Not found');
  });

  it('handles ZodError with 400 status', async () => {
    const schema = z.object({ name: z.string() });
    const handler = withErrorHandler(async () => {
      schema.parse({ name: 123 });
      return Response.json({});
    });
    const res = await handler(new Request('http://localhost'), {});
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('VALIDATION');
    expect(body.details).toBeDefined();
  });

  it('handles unknown errors with 500 status', async () => {
    const handler = withErrorHandler(async () => {
      throw new Error('something broke');
    });
    const res = await handler(new Request('http://localhost'), {});
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('INTERNAL');
    expect(body.message).toBe('Internal server error');
  });
});
