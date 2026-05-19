import { Request, Response, NextFunction, RequestHandler } from 'express';

// Without this wrapper, every async controller needs its own try/catch.
// This HOF catches rejected promises and forwards them to Express error middleware.
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
