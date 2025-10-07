import express from 'express';
import cors from 'cors';
import helmet from 'helmet'; // Sécurité des en-têtes HTTP
import rateLimit from 'express-rate-limit'; // Limiter le nombre de requêtes
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env';
import { AppError } from './errors/AppError'; 
import { errorHandler } from './middlewares/errorHandler'; 

const app = express();

// Sécurité & middlewares
app.disable('x-powered-by'); // Cache le fait qu’on utilise Express
app.use(helmet());

// CORS : vérifie les origines autorisées définies dans ENV
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // Autorise les outils sans origin (ex: curl, Postman)
      if (ENV.CORS_ORIGIN_LIST.includes(origin)) return cb(null, true);
      return cb(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);

// Parsing et middlewares utiles
app.use(express.json({ limit: '10kb' })); // Limite la taille des bodies
app.use(cookieParser()); // Lecture des cookies
app.use(pinoHttp());

// Rate limiting configuré via ENV
app.use(
  rateLimit({
    windowMs: ENV.RATE_WINDOW_MIN * 60 * 1000, // Convertit minutes → millisecondes
    max: ENV.RATE_MAX_REQ,                     // Nombre max de requêtes par IP
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Trop de requêtes. Réessaie dans quelques minutes.',
          windowMinutes: ENV.RATE_WINDOW_MIN,
          limit: ENV.RATE_MAX_REQ,
        },
      });
    },
  })
);

// Healthcheck minimal (liveness)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Route de test d’erreur volontaire
// Cette route simule une erreur serveur inattendue (500) pour vérifier la gestion des erreurs (errorHandler).
// fonctionne bien/
// Quand on appelle /boom -> une erreur est lancée -> interceptée par errorHandler
app.get('/boom', (_req, _res) => {
  throw new Error('Boom');
});

// Middleware 404
// Doit être le dernier middleware avant errorHandler
// car il attrape les routes non gérées
app.use((_req, _res, next) => next(AppError.notFound()));

// Middleware global de gestion des erreurs
// Il intercepte toutes les erreurs passées à next(err)
// - Si cest une AppError (ex: NOT_FOUND, BAD_REQUEST), il renvoie le JSON prévu
// - Sinon, il renvoie une erreur 500 générique pour ne pas exposer les détails internes
app.use(errorHandler);

export default app;
