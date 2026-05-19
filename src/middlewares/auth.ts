import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AppError } from '../utils/AppError';
import { HTTP } from '../utils/httpStatus';

// Augment Express Request to include authenticated user payload
export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const authenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Missing or malformed token', HTTP.UNAUTHORIZED);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch {
    throw new AppError('Invalid or expired token', HTTP.UNAUTHORIZED);
  }
};
