// Distinguishing "operational" errors (expected: 404, 401) from
// "programmer" errors (unexpected: TypeError) is a key production pattern.
// Only operational errors get friendly messages; programmer errors log to monitoring.
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // flag for error middleware
    Error.captureStackTrace(this, this.constructor);
  }
}
