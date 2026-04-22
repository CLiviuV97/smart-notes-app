import { AppError } from '@/server/errors/AppError';

const AI_RATE_LIMIT = 10;
const WINDOW_MS = 60_000;

const store = new Map<string, number[]>();

export function checkAIRateLimit(userId: string): void {
  const now = Date.now();
  const timestamps = store.get(userId) ?? [];

  // Remove entries outside the window
  const valid = timestamps.filter((t) => now - t < WINDOW_MS);

  if (valid.length >= AI_RATE_LIMIT) {
    store.set(userId, valid);
    throw new AppError(
      'AI generation rate limit exceeded. Max 10 requests per minute.',
      'RATE_LIMIT_EXCEEDED',
      429,
    );
  }

  valid.push(now);
  store.set(userId, valid);
}
