import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/response';
import { HTTP } from '../utils/httpStatus';
import { config } from '../config';
import logger from '../utils/logger';

// Single error-handling middleware for the entire app.
// Order matters: more specific error types first.
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Zod validation errors → 422 with field-level details
  if (err instanceof ZodError) {
    sendError(res, 'Validation failed', HTTP.UNPROCESSABLE, err.flatten().fieldErrors);
    return;
  }

  // Known operational errors (thrown with AppError)
  if (err instanceof AppError && err.isOperational) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Unknown errors: log in dev, hide details in prod
  logger.error('Unhandled error', { message: err.message, stack: err.stack });
  sendError(
    res,
    config.isDev ? err.message : 'Internal server error',
    HTTP.INTERNAL_SERVER_ERROR
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found`, HTTP.NOT_FOUND);
};
