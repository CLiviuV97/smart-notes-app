const REDACT_KEYS = new Set([
  'email',
  'token',
  'idtoken',
  'authorization',
  'password',
  'private_key',
]);

const NO_TRUNCATE_KEYS = new Set(['stack', 'componentstack', 'sql', 'query', 'body']);

const MAX_STRING_LENGTH = 200;

function redact(value: unknown, parentKey?: string, seen?: WeakSet<object>): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    if (parentKey && NO_TRUNCATE_KEYS.has(parentKey.toLowerCase())) {
      return value;
    }
    return value.length > MAX_STRING_LENGTH
      ? value.slice(0, MAX_STRING_LENGTH) + '[TRUNCATED]'
      : value;
  }

  if (typeof value === 'object') {
    const tracker = seen ?? new WeakSet();
    if (tracker.has(value as object)) return '[Circular]';
    tracker.add(value as object);

    if (Array.isArray(value)) {
      return value.map((item) => redact(item, parentKey, tracker));
    }

    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (REDACT_KEYS.has(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = redact(val, key, tracker);
      }
    }
    return result;
  }

  return value;
}

function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return JSON.stringify({
      _logger_error: 'Failed to stringify log entry',
      level: (obj as Record<string, unknown>)?.level,
      message: (obj as Record<string, unknown>)?.message,
      timestamp: (obj as Record<string, unknown>)?.timestamp,
    });
  }
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const minLevel = LOG_LEVELS[(process.env.LOG_LEVEL as LogLevel) ?? 'info'] ?? LOG_LEVELS.info;

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (LOG_LEVELS[level] < minLevel) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? (redact(meta) as Record<string, unknown>) : {}),
  };

  const fn =
    level === 'error'
      ? console.error
      : level === 'warn'
        ? console.warn
        : level === 'debug'
          ? console.debug
          : console.log;
  fn(safeStringify(entry));
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
};
