import { z } from 'zod';

// Tous les champs sont optionnels => l'admin peut modifier partiellement
export const LieuUpdateSchema = z.object({
  nom: z.string().min(2, 'Le nom est trop court').max(250).optional(),
  description: z.string().optional(),
  adresse: z.string().max(255).optional(),
  dateCreation: z.coerce.date().optional(),
  dateDebut: z.coerce.date().nullable().optional(),
  dateFin: z.coerce.date().nullable().optional(),
  prixAdulte: z.string().max(50).nullable().optional(),
  prixEnfant: z.string().max(50).nullable().optional(),
  latitude: z.union([z.string(), z.number()]).nullable().optional(),
  longitude: z.union([z.string(), z.number()]).nullable().optional(),
  publicCible: z.string().max(100).nullable().optional(),
  urlInfos: z.string().url().max(255).nullable().optional(),
  infosAcces: z.string().nullable().optional(),

  // Spécifique aux relations
  quartierNom: z.string().optional(),
  categories: z.array(z.string().min(1)).optional(), // si présent -> on remplace les catégories
});
