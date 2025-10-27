import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validate } from '../middlewares/validate';
import { LieuCreateSchema } from '../validation/lieu.schema';

const prisma = new PrismaClient();
const router = Router();

// GET /lieux
router.get('/', async (req: Request, res: Response) => {
  try {
    // 1. Récupérer / normaliser les paramètres de requête
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10), 1);
    const pageSizeRaw = Math.max(parseInt(String(req.query.pageSize ?? '10'), 10), 1);
    const pageSize = Math.min(pageSizeRaw, 50); // sécurité: pas plus de 50

    const q = (req.query.q as string | undefined)?.trim();
    const quartier = (req.query.quartier as string | undefined)?.trim();
    const categorie = (req.query.categorie as string | undefined)?.trim();

    // 2. Construire dynamiquement le "where" Prisma
    const where: any = {};

    if (q) {
      // recherche texte approximative
      where.OR = [
        { nom: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { adresse: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (quartier) {
      where.quartier = {
        nom: { equals: quartier },
      };
    }

    if (categorie) {
      // On filtre les lieux qui ont AU MOINS une catégorie donnée
      where.categories = {
        some: {
          categorie: {
            nom: { equals: categorie },
          },
        },
      };
    }

    // 3. Récupérer total + page de lieux en parallèle
    const [total, lieux] = await Promise.all([
      prisma.lieu.count({ where }),
      prisma.lieu.findMany({
        where,
        orderBy: { dateCreation: 'desc' }, // les plus récents d'abord
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          quartier: true,
          photos: true,
          categories: {
            include: { categorie: true }, // pour avoir le nom de la catégorie
          },
          _count: {
            select: {
              avis: true,
              favoris: true,
            },
          },
        },
      }),
    ]);

    // 4. Calculer la moyenne des notes pour chaque lieu en une seule requête groupée
    const lieuIds = lieux.map(l => l.id);

    const notes = lieuIds.length
      ? await prisma.avis.groupBy({
          by: ['lieuId'],
          where: { lieuId: { in: lieuIds } },
          _avg: { note: true },
        })
      : [];

    // Map { lieuId -> moyenne }
    const avgByLieuId = new Map<number, number>();
    for (const n of notes) {
      avgByLieuId.set(n.lieuId, n._avg.note ?? 0);
    }

    // 5. Mise en forme de la réponse côté API (important pour le front)
    const items = lieux.map(l => ({
      id: l.id,
      nom: l.nom,
      description: l.description,
      adresse: l.adresse,
      dateCreation: l.dateCreation,
      prixAdulte: l.prixAdulte,
      prixEnfant: l.prixEnfant,
      latitude: l.latitude ? Number(l.latitude) : null,
      longitude: l.longitude ? Number(l.longitude) : null,
      publicCible: l.publicCible,
      urlInfos: l.urlInfos,
      infosAcces: l.infosAcces,
      quartier: l.quartier?.nom, // on renvoie juste le nom du quartier
      categories: l.categories.map(c => c.categorie.nom),
      photos: l.photos.map(p => ({
        id: p.id,
        url: p.url,
        description: p.description,
      })),
      stats: {
        avisCount: l._count.avis,
        favorisCount: l._count.favoris,
        avgNote: avgByLieuId.get(l.id) ?? 0,
      },
    }));

    // 6. Réponse finale
    res.json({
      page,
      pageSize,
      total,
      items,
    });
  } catch (err) {
    console.error('GET /lieux error', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /lieux
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
