import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validate } from '../middlewares/validate';
import { LieuCreateSchema } from '../validation/lieu.schema';

const prisma = new PrismaClient();
const router = Router();

router.post('/', validate(LieuCreateSchema), async (req: Request, res: Response) => {
  try {
    const {
      nom, description, adresse, dateCreation, dateDebut, dateFin,
      prixAdulte, prixEnfant, latitude, longitude, publicCible,
      urlInfos, infosAcces, quartierNom, categories,
    } = req.body;

    // 1) Quartier (créé s'il n'existe pas)
    const quartier = await prisma.quartier.upsert({
      where: { nom: quartierNom },
      update: {},
      create: { nom: quartierNom },
    });

    // 2) Créer le lieu
    const lieu = await prisma.lieu.create({
      data: {
        nom,
        description,
        adresse,
        dateCreation: new Date(dateCreation),
        dateDebut: dateDebut ? new Date(dateDebut) : null,
        dateFin: dateFin ? new Date(dateFin) : null,
        prixAdulte: prixAdulte ?? null,
        prixEnfant: prixEnfant ?? null,
        latitude: latitude ?? null,   // Decimal -> string OK
        longitude: longitude ?? null, // Decimal -> string OK
        publicCible: publicCible ?? null,
        urlInfos: urlInfos ?? null,
        infosAcces: infosAcces ?? null,
        quartier: { connect: { id: quartier.id } },
      },
    });

    // 3) Rattacher les catégories (créées si absentes)
    if (Array.isArray(categories) && categories.length) {
      for (const nomCat of categories) {
        const cat = await prisma.categorie.upsert({
          where: { nom: nomCat },
          update: {},
          create: { nom: nomCat },
        });
        await prisma.lieuCategorie.upsert({
          where: { lieuId_categorieId: { lieuId: lieu.id, categorieId: cat.id } },
          update: {},
          create: { lieuId: lieu.id, categorieId: cat.id },
        });
      }
    }

    // 4) Retourne le lieu complet (avec relations)
    const full = await prisma.lieu.findUnique({
      where: { id: lieu.id },
      include: {
        quartier: true,
        categories: { include: { categorie: true } },
        photos: true,
      },
    });

    res.status(201).json(full);
  } catch (err) {
    console.error('POST /lieux error', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
