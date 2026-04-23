import { checkAIRateLimit, checkPdfRateLimit, acquirePdfConcurrency, releasePdfConcurrency } from '../rateLimit';
import { AppError } from '@/server/errors/AppError';

describe('checkAIRateLimit', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows up to 10 requests within the window', () => {
    for (let i = 0; i < 10; i++) {
      expect(() => checkAIRateLimit('user-rate-ai')).not.toThrow();
    }
  });

  it('throws on the 11th request within the window', () => {
    for (let i = 0; i < 10; i++) {
      checkAIRateLimit('user-rate-ai-11');
    }
    expect(() => checkAIRateLimit('user-rate-ai-11')).toThrow(AppError);
    expect(() => checkAIRateLimit('user-rate-ai-11')).toThrow(/rate limit exceeded/i);
  });

  it('resets after the 60s window elapses', () => {
    for (let i = 0; i < 10; i++) {
      checkAIRateLimit('user-rate-ai-reset');
    }
    expect(() => checkAIRateLimit('user-rate-ai-reset')).toThrow();

    jest.advanceTimersByTime(60_001);

    expect(() => checkAIRateLimit('user-rate-ai-reset')).not.toThrow();
  });
});

describe('checkPdfRateLimit', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('allows up to 5 PDF imports within the window', () => {
    for (let i = 0; i < 5; i++) {
      expect(() => checkPdfRateLimit('user-pdf')).not.toThrow();
    }
  });

  it('throws on the 6th PDF import within the window', () => {
    for (let i = 0; i < 5; i++) {
      checkPdfRateLimit('user-pdf-6');
    }
    expect(() => checkPdfRateLimit('user-pdf-6')).toThrow(AppError);
  });
});

describe('acquirePdfConcurrency / releasePdfConcurrency', () => {
  it('allows a single concurrent upload', () => {
    expect(() => acquirePdfConcurrency('user-conc')).not.toThrow();
    releasePdfConcurrency('user-conc');
  });

  it('throws if user already has an active upload', () => {
    acquirePdfConcurrency('user-conc-dup');
    expect(() => acquirePdfConcurrency('user-conc-dup')).toThrow(AppError);
    releasePdfConcurrency('user-conc-dup');
  });

  it('allows re-upload after release', () => {
    acquirePdfConcurrency('user-conc-re');
    releasePdfConcurrency('user-conc-re');
    expect(() => acquirePdfConcurrency('user-conc-re')).not.toThrow();
    releasePdfConcurrency('user-conc-re');
  });
});
