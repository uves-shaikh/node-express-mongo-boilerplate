import { Response } from 'express';
import { HTTP } from './httpStatus';

// Enforcing a consistent response envelope across all endpoints
// makes frontend integration and API consumers predictable

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = HTTP.OK,
  message = 'Success'
) => {
  return res.status(statusCode).json({ success: true, message, data });
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  meta: PaginationMeta
) => {
  return res.status(HTTP.OK).json({ success: true, data, meta });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = HTTP.INTERNAL_SERVER_ERROR,
  errors?: unknown
) => {
  return res.status(statusCode).json({ success: false, message, errors });
};
