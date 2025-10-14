import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helpers "ensure" pour upsert (crée si absent, sinon ne fait rien)
async function ensureQuartier(nom: string) {
  return prisma.quartier.upsert({
    where: { nom }, // Quartier.nom est @unique
    update: {},
    create: { nom },
  });
}

async function ensureCategorie(nom: string) {
  return prisma.categorie.upsert({
    where: { nom }, // Categorie.nom est @unique
    update: {},
    create: { nom },
  });
}

async function ensureUtilisateur(email: string, data: {
  nom: string; prenom: string; motDePasse: string; role: string; dateInscription?: Date | null;
}) {
  return prisma.utilisateur.upsert({
    where: { email }, // Utilisateur.email est @unique
    update: {},
    create: {
      email,
      nom: data.nom,
      prenom: data.prenom,
      motDePasse: data.motDePasse,
      role: data.role,
      dateInscription: data.dateInscription ?? new Date(),
    },
  });
}

/**
 * Helper pour créer un lieu avec rattachement à un quartier et plusieurs catégories.
 * Si le quartier ou les catégories n'existent pas, ils sont créés.
 * Si le lieu existe déjà (même nom dans le même quartier), il n'est pas recréé.
 */
async function ensureLieuAvecCategories(input: {
  nom: string;
  description: string;
  adresse: string;
  dateCreation: Date;
  dateDebut?: Date | null;
  dateFin?: Date | null;
  prixAdulte?: string | null;
  prixEnfant?: string | null;
  latitude?: string | null;   // utiliser string pour Decimal
  longitude?: string | null;  // utiliser string pour Decimal
  publicCible?: string | null;
  urlInfos?: string | null;
  infosAcces?: string | null;
  quartierNom: string;
  categories: string[];
}) {
  const q = await ensureQuartier(input.quartierNom);

  // 1) trouver un lieu existant sur le couple (nom, quartierId)
  let lieu = await prisma.lieu.findFirst({
    where: { nom: input.nom, quartierId: q.id },
  });

  // 2) sinon créer
  if (!lieu) {
    lieu = await prisma.lieu.create({
      data: {
        nom: input.nom,
        description: input.description,
        adresse: input.adresse,
        dateCreation: input.dateCreation,
        dateDebut: input.dateDebut ?? null,
        dateFin: input.dateFin ?? null,
        prixAdulte: input.prixAdulte ?? null,
        prixEnfant: input.prixEnfant ?? null,
        latitude: input.latitude ?? null,     // Decimal en string OK
        longitude: input.longitude ?? null,   // Decimal en string OK
        publicCible: input.publicCible ?? null,
        urlInfos: input.urlInfos ?? null,
        infosAcces: input.infosAcces ?? null,
        quartier: { connect: { id: q.id } },
      },
    });
  }

  // 3) rattacher les catégories via la table de jonction explicite
  for (const nomCat of input.categories) {
    const cat = await ensureCategorie(nomCat);
    await prisma.lieuCategorie.upsert({
      where: {
        // @@id([lieuId, categorieId]) -> sélecteur composite
        lieuId_categorieId: { lieuId: lieu.id, categorieId: cat.id },
      },
      update: {},
      create: { lieuId: lieu.id, categorieId: cat.id },
    });
  }

  return lieu;
}

async function main() {
  // --- Utilisateur démo ---
  const user = await ensureUtilisateur('demo@algexplore.dev', {
    nom: 'Demo',
    prenom: 'User',
    motDePasse: 'hashed-demo', // à remplacer !! par un vrai hash (bcrypt)
    role: 'user',              // (admin|user) – contrainte gérée côté SQL
  });

  // --- Catégories de base ---
  const baseCats = ['musée', 'restaurant', 'parc', 'architecture', 'histoire'];
  await Promise.all(baseCats.map((c) => ensureCategorie(c)));

  // --- Lieux (exemples) ---
  const lieu1 = await ensureLieuAvecCategories({
    nom: 'Musée National des Beaux-Arts',
    description: 'Grand musée avec collections d’art algérien et international.',
    adresse: 'Rue Mohamed Belouizdad, Alger',
    dateCreation: new Date('1930-05-05'),
    prixAdulte: '500 DA',
    prixEnfant: '0-200 DA',
    latitude: '36.76600000',
    longitude: '3.06100000',
    publicCible: 'Adultes, familles, étudiants',
    urlInfos: 'https://exemple.dz/mnba',
    infosAcces: 'Bus, taxi, accès piéton facile',
    quartierNom: 'El Madania',
    categories: ['musée', 'histoire', 'architecture'],
  });

  const lieu2 = await ensureLieuAvecCategories({
    nom: 'Jardin d’Essai du Hamma',
    description: 'Parc botanique historique avec grande diversité végétale.',
    adresse: 'Hamma, Alger',
    dateCreation: new Date('1832-01-01'),
    prixAdulte: '200 DA',
    prixEnfant: '100 DA',
    latitude: '36.74850000',
    longitude: '3.07110000',
    publicCible: 'Familles, touristes, scolaires',
    urlInfos: 'https://exemple.dz/hamma',
    infosAcces: 'Métro Jardin d’Essai + tram/bus',
    quartierNom: 'Hamma',
    categories: ['parc', 'histoire'],
  });

  // --- Photos (exemples, sur lieu1) ---
  await prisma.photo.upsert({
    where: { id: 1 }, // upsert sur PK arbitraire pour un seed idempotent minimal
    update: {
      url: 'https://picsum.photos/id/1015/800/600',
      description: 'Façade principale du musée',
      lieuId: lieu1.id,
    },
    create: {
      url: 'https://picsum.photos/id/1015/800/600',
      description: 'Façade principale du musée',
      lieuId: lieu1.id,
    },
  });

  await prisma.photo.upsert({
    where: { id: 2 },
    update: {
      url: 'https://picsum.photos/id/1025/800/600',
      description: 'Galerie intérieure',
      lieuId: lieu1.id,
    },
    create: {
      url: 'https://picsum.photos/id/1025/800/600',
      description: 'Galerie intérieure',
      lieuId: lieu1.id,
    },
  });

  // --- Avis (sur lieu1) ---
  // Pas d’unicité composite sur (utilisateurId, lieuId) dans le modèle Avis,
  // donc on fait un "findFirst puis create" pour éviter les doublons au re-seed.
  // (On vérifie d'abord s'il n'existe pas déjà (évite doublons si re-seed))
  const avisExist = await prisma.avis.findFirst({
    where: { utilisateurId: user.id, lieuId: lieu1.id },
  });
  if (!avisExist) {
    await prisma.avis.create({
      data: {
        note: 5,
        commentaire: 'Super visite, très riche !',
        utilisateurId: user.id,
        lieuId: lieu1.id,
      },
    });
  }

  // --- Favori (clé primaire composite → on peut faire upsert direct) ---
  await prisma.favori.upsert({
    where: { utilisateurId_lieuId: { utilisateurId: user.id, lieuId: lieu1.id } },
    update: {},
    create: { utilisateurId: user.id, lieuId: lieu1.id },
  });

  console.log('Seed terminé');
}

main()
  .catch((e) => {
    console.error('Seed échoué', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
