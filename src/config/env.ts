// import 'dotenv/config';

// export const ENV = {
//   NODE_ENV: process.env.NODE_ENV ?? 'development',
//   PORT: Number(process.env.PORT ?? 3000),
//   CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:4200'
// };




// src/config/env.ts
import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Base de données
  DATABASE_URL: z.string().url('DATABASE_URL doit être une URL valide'),

  // Optionnel (Prisma shadow DB)
  SHADOW_DATABASE_URL: z.string().url().optional(),

  // CORS (liste séparée par des virgules)
  CORS_ORIGINS: z.string().default('http://localhost:4200'),

  // Rate limit basique (pour futurs tickets Sécurité)
  RATE_WINDOW_MIN: z.coerce.number().int().positive().default(15),
  RATE_MAX_REQ: z.coerce.number().int().positive().default(200),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map(i => `- ${i.path.join('.')}: ${i.message}`)
    .join('\n');
  // Arrêt propre si config invalide
  console.error('Configuration ENV invalide :\n' + issues);
  process.exit(1);
}

export const ENV = {
  ...parsed.data,
  // Normalisation pratique : tableau d’origines
  CORS_ORIGIN_LIST: parsed.data.CORS_ORIGINS.split(',')
    .map(o => o.trim())
    .filter(Boolean),
};
