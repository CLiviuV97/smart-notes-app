import { AppError } from '@/server/errors/AppError';

// --- AI Summary rate limit ---

const AI_RATE_LIMIT = 10;
const WINDOW_MS = 60_000;

const store = new Map<string, number[]>();

export function checkAIRateLimit(userId: string): void {
  const now = Date.now();
  const timestamps = store.get(userId) ?? [];

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

// --- PDF Import rate limit (5 per hour) ---

const PDF_RATE_LIMIT = 5;
const PDF_WINDOW_MS = 3_600_000;

const pdfStore = new Map<string, number[]>();

export function checkPdfRateLimit(userId: string): void {
  const now = Date.now();
  const timestamps = pdfStore.get(userId) ?? [];

  const valid = timestamps.filter((t) => now - t < PDF_WINDOW_MS);

  if (valid.length >= PDF_RATE_LIMIT) {
    pdfStore.set(userId, valid);
    throw new AppError(
      'PDF import rate limit exceeded. Max 5 imports per hour.',
      'RATE_LIMIT_EXCEEDED',
      429,
    );
  }

  valid.push(now);
  pdfStore.set(userId, valid);
}

// --- PDF concurrency (1 active upload per user) ---

const activePdfUploads = new Set<string>();

export function acquirePdfConcurrency(userId: string): void {
  if (activePdfUploads.has(userId)) {
    throw new AppError(
      'You already have a PDF import in progress. Please wait for it to finish.',
      'CONFLICT',
      409,
    );
  }
  activePdfUploads.add(userId);
}

export function releasePdfConcurrency(userId: string): void {
  activePdfUploads.delete(userId);
}
