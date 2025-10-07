export class AppError extends Error {
  public status: number;
  public code: string;

  constructor(status: number, code: string, message?: string) {
    super(message ?? code);
    this.status = status;
    this.code = code;
    Error.captureStackTrace?.(this, AppError);
  }

  static notFound(msg = 'Route not found') {
    return new AppError(404, 'NOT_FOUND', msg);
  }
}
