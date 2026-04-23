const REDACT_KEYS = new Set([
  'email',
  'token',
  'idtoken',
  'authorization',
  'password',
  'private_key',
]);

const MAX_STRING_LENGTH = 200;

function redact(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return obj.length > MAX_STRING_LENGTH ? obj.slice(0, MAX_STRING_LENGTH) + '[TRUNCATED]' : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redact);
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (REDACT_KEYS.has(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = redact(value);
      }
    }
    return result;
  }

  return obj;
}

type LogLevel = 'info' | 'warn' | 'error';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? (redact(meta) as Record<string, unknown>) : {}),
  };

  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  fn(JSON.stringify(entry));
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
};
