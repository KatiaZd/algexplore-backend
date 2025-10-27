import { z } from 'zod';

export const LieuCreateSchema = z.object({
  nom: z.string().min(2).max(250),
  description: z.string().min(5),
  adresse: z.string().min(2).max(255),
  dateCreation: z.coerce.date(),           // accepte string/Date -> Date
  dateDebut: z.coerce.date().nullable().optional(),
  dateFin: z.coerce.date().nullable().optional(),
  prixAdulte: z.string().max(50).nullable().optional(),
  prixEnfant: z.string().max(50).nullable().optional(),
  latitude: z.string().nullable().optional(),   // on mettra tel quel dans Prisma (Decimal)
  longitude: z.string().nullable().optional(),
  publicCible: z.string().max(100).nullable().optional(),
  urlInfos: z.string().url().max(255).nullable().optional(),
  infosAcces: z.string().nullable().optional(),
  quartierNom: z.string().min(1),               // on rattache par nom unique
  categories: z.array(z.string().min(1)).default([]),
});
