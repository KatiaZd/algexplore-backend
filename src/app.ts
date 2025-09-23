import express from 'express';
import cors from 'cors';
import helmet from 'helmet'; // Pour la sécurité des en-têtes HTTP
import rateLimit from 'express-rate-limit'; // Pour limiter le nombre de requêtes 
import pinoHttp from 'pino-http';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env';

const app = express();

// Sécurité & middlewares
app.use(helmet());
app.use(
  cors({
    origin: ENV.CORS_ORIGIN, //"http://localhost:4200"
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' })); // Limite la taille du corps des requêtes pour éviter les attaques par déni de service
app.use(cookieParser()); // Pour lire les cookies
app.use(pinoHttp());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,                  // 200 req / 15 min / IP
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Healthcheck minimal (liveness)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default app;
