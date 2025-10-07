import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ENV } from '../config/env';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Erreurs "connues" de l'app
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message },
    });
  }

  // Erreurs génériques
  const message = 'Unexpected error';
  if (ENV.NODE_ENV !== 'production') {
    // En dev: log détaillé
    // eslint-disable-next-line no-console
    console.error('[ERROR]', err);
  }

  return res.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message },
  });
}
// En production, on ne détaille pas l'erreur pour éviter de divulguer des infos sensibles
// En dev, on loggue l'erreur complète dans la console pour aider au debug