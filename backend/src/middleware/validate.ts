import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './auth';

export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted: Record<string, string[]> = {};
    errors.array().forEach((err) => {
      const field = 'path' in err ? String(err.path) : 'general';
      if (!formatted[field]) formatted[field] = [];
      formatted[field].push(err.msg);
    });
    return next(new AppError(400, 'Validation failed', formatted));
  }

  next();
};

export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  const sanitize = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return value.trim().replace(/<[^>]*>/g, '');
    }
    if (Array.isArray(value)) {
      return value.map(sanitize);
    }
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, sanitize(v)])
      );
    }
    return value;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body);
  }
  next();
};
