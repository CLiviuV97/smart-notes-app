import { AppError } from '@/server/errors/AppError';

// --- Sliding-window rate limit factory ---

function makeRateLimit(config: { limit: number; windowMs: number; errorMessage: string }) {
  const store = new Map<string, number[]>();
  return function check(userId: string): void {
    const now = Date.now();
    const valid = (store.get(userId) ?? []).filter((t) => now - t < config.windowMs);

    if (valid.length === 0) {
      store.delete(userId);
    }

    if (valid.length >= config.limit) {
      store.set(userId, valid);
      throw new AppError(config.errorMessage, 'RATE_LIMIT_EXCEEDED', 429);
    }

    valid.push(now);
    store.set(userId, valid);
  };
}

export const checkAIRateLimit = makeRateLimit({
  limit: 10,
  windowMs: 60_000,
  errorMessage: 'AI generation rate limit exceeded. Max 10 requests per minute.',
});

export const checkPdfRateLimit = makeRateLimit({
  limit: 5,
  windowMs: 3_600_000,
  errorMessage: 'PDF import rate limit exceeded. Max 5 imports per hour.',
});

// --- PDF concurrency (1 active upload per user, with TTL) ---

const activePdfUploads = new Map<string, number>();
const PDF_LOCK_TTL_MS = 90_000;

export function acquirePdfConcurrency(userId: string): void {
  const lockedAt = activePdfUploads.get(userId);
  if (lockedAt !== undefined && Date.now() - lockedAt < PDF_LOCK_TTL_MS) {
    throw new AppError(
      'You already have a PDF import in progress. Please wait for it to finish.',
      'CONFLICT',
      409,
    );
  }
  activePdfUploads.set(userId, Date.now());
}

export function releasePdfConcurrency(userId: string): void {
  activePdfUploads.delete(userId);
}
