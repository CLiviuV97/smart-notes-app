import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const logErrorSchema = z.object({
  message: z.string().max(2000),
  stack: z.string().max(5000).optional(),
  componentStack: z.string().max(5000).optional(),
  url: z.string().max(500).optional(),
  userAgent: z.string().max(500).optional(),
});

// Simple in-memory rate limit: 10 requests per minute per IP
const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitStore.get(ip) ?? [];
  const valid = timestamps.filter((t) => now - t < WINDOW_MS);

  if (valid.length >= RATE_LIMIT) {
    rateLimitStore.set(ip, valid);
    return false;
  }

  valid.push(now);
  rateLimitStore.set(ip, valid);
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'RATE_LIMIT', message: 'Too many error reports' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'VALIDATION', message: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = logErrorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  logger.error('Client error', {
    clientError: parsed.data.message,
    stack: parsed.data.stack,
    componentStack: parsed.data.componentStack,
    url: parsed.data.url,
    userAgent: parsed.data.userAgent,
    ip,
  });

  return NextResponse.json({ ok: true });
}
