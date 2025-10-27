import { ZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: ZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed',
        issues: parsed.error.issues.map(i => ({ path: i.path, message: i.message })),
      });
    }
    req.body = parsed.data; // body nettoyé/typé
    next();
  };
