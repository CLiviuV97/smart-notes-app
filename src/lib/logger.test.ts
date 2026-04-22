import { logger } from './logger';

let logSpy: jest.SpiedFunction<typeof console.log>;
let warnSpy: jest.SpiedFunction<typeof console.warn>;
let errorSpy: jest.SpiedFunction<typeof console.error>;

beforeEach(() => {
  logSpy = jest.spyOn(console, 'log').mockImplementation();
  warnSpy = jest.spyOn(console, 'warn').mockImplementation();
  errorSpy = jest.spyOn(console, 'error').mockImplementation();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function lastEntry(spy: jest.SpiedFunction<(...args: unknown[]) => void>): Record<string, unknown> {
  const calls = spy.mock.calls;
  const last = calls[calls.length - 1];
  return JSON.parse(last![0] as string);
}

describe('logger', () => {
  it('outputs structured JSON with timestamp and level', () => {
    logger.info('test message');
    const entry = lastEntry(logSpy);
    expect(entry.level).toBe('info');
    expect(entry.message).toBe('test message');
    expect(entry.timestamp).toBeDefined();
  });

  it('redacts email, token, and password', () => {
    logger.info('user login', {
      email: 'user@example.com',
      token: 'abc123',
      password: 'secret',
    });
    const entry = lastEntry(logSpy);
    expect(entry.email).toBe('[REDACTED]');
    expect(entry.token).toBe('[REDACTED]');
    expect(entry.password).toBe('[REDACTED]');
  });

  it('redacts keys case-insensitively', () => {
    logger.info('auth', { Authorization: 'Bearer xyz', idToken: 'tok' });
    const entry = lastEntry(logSpy);
    expect(entry.Authorization).toBe('[REDACTED]');
    expect(entry.idToken).toBe('[REDACTED]');
  });

  it('redacts nested objects', () => {
    logger.warn('nested', {
      user: { email: 'a@b.com', name: 'Alice' },
    });
    const entry = lastEntry(warnSpy);
    const user = entry.user as Record<string, unknown>;
    expect(user.email).toBe('[REDACTED]');
    expect(user.name).toBe('Alice');
  });

  it('truncates strings longer than 200 chars', () => {
    const longString = 'x'.repeat(300);
    logger.info('long', { data: longString });
    const entry = lastEntry(logSpy);
    expect(entry.data).toBe('x'.repeat(200) + '[TRUNCATED]');
  });

  it('uses console.error for error level', () => {
    logger.error('fail', { error: 'something broke' });
    expect(errorSpy).toHaveBeenCalled();
    const entry = lastEntry(errorSpy);
    expect(entry.level).toBe('error');
  });
});
