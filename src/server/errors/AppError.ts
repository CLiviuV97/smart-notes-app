export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(message, 'NOT_FOUND', 404);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, 'FORBIDDEN', 403);
  }
}
