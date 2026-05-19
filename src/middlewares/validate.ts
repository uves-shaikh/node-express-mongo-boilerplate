import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

// Generic validation middleware factory — pass a Zod schema, get a middleware back.
// Validates req.body and replaces it with the parsed (typed) output.
export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    // .parse() throws ZodError on failure → caught by errorHandler middleware
    req.body = schema.parse(req.body);
    next();
  };
