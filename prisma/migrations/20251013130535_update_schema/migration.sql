/*
  Warnings:

  - You are about to drop the `Avis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Categorie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Favori` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lieu` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LieuCategorie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Photo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Avis" DROP CONSTRAINT "Avis_lieuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Avis" DROP CONSTRAINT "Avis_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Favori" DROP CONSTRAINT "Favori_lieuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Favori" DROP CONSTRAINT "Favori_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LieuCategorie" DROP CONSTRAINT "LieuCategorie_categorieId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LieuCategorie" DROP CONSTRAINT "LieuCategorie_lieuId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Photo" DROP CONSTRAINT "Photo_lieuId_fkey";

-- DropTable
DROP TABLE "public"."Avis";

-- DropTable
DROP TABLE "public"."Categorie";

-- DropTable
DROP TABLE "public"."Favori";

-- DropTable
DROP TABLE "public"."Lieu";

-- DropTable
DROP TABLE "public"."LieuCategorie";

-- DropTable
DROP TABLE "public"."Photo";

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."utilisateur" (
    "id_utilisateur" SERIAL NOT NULL,
    "nom_utilisateur" VARCHAR(50) NOT NULL,
    "prenom" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "mot_de_passe" VARCHAR(255) NOT NULL,
    "date_inscription" DATE,
    "role" VARCHAR(20) NOT NULL,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id_utilisateur")
);

-- CreateTable
CREATE TABLE "public"."quartier" (
    "id_quartier" SERIAL NOT NULL,
    "nom_quartier" VARCHAR(100) NOT NULL,

    CONSTRAINT "quartier_pkey" PRIMARY KEY ("id_quartier")
);

-- CreateTable
CREATE TABLE "public"."lieu" (
    "id_lieu" SERIAL NOT NULL,
    "nom_lieu" VARCHAR(250) NOT NULL,
    "description_lieu" TEXT NOT NULL,
    "adresse" VARCHAR(255) NOT NULL,
    "date_creation" DATE NOT NULL,
    "date_debut" DATE,
    "date_fin" DATE,
    "prix_adulte" VARCHAR(50),
    "prix_enfant" VARCHAR(50),
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "public_cible" VARCHAR(100),
    "url_infos" VARCHAR(255),
    "infos_acces" TEXT,
    "id_quartier" INTEGER NOT NULL,

    CONSTRAINT "lieu_pkey" PRIMARY KEY ("id_lieu")
);

-- CreateTable
CREATE TABLE "public"."categorie" (
    "id_categorie" SERIAL NOT NULL,
    "nom_categorie" VARCHAR(100) NOT NULL,

    CONSTRAINT "categorie_pkey" PRIMARY KEY ("id_categorie")
);

-- CreateTable
CREATE TABLE "public"."lieu_categorie" (
    "id_lieu" INTEGER NOT NULL,
    "id_categorie" INTEGER NOT NULL,

    CONSTRAINT "lieu_categorie_pkey" PRIMARY KEY ("id_lieu","id_categorie")
);

-- CreateTable
CREATE TABLE "public"."photo" (
    "id_photo" SERIAL NOT NULL,
    "url_photo" VARCHAR(255) NOT NULL,
    "description_photo" TEXT,
    "id_lieu" INTEGER NOT NULL,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id_photo")
);

-- CreateTable
CREATE TABLE "public"."avis" (
    "id_avis" SERIAL NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "id_utilisateur" INTEGER NOT NULL,
    "id_lieu" INTEGER NOT NULL,

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id_avis")
);

-- CreateTable
CREATE TABLE "public"."favori" (
    "id_utilisateur" INTEGER NOT NULL,
    "id_lieu" INTEGER NOT NULL,

    CONSTRAINT "favori_pkey" PRIMARY KEY ("id_utilisateur","id_lieu")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "public"."utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "quartier_nom_quartier_key" ON "public"."quartier"("nom_quartier");

-- CreateIndex
CREATE INDEX "lieu_id_quartier_idx" ON "public"."lieu"("id_quartier");

-- CreateIndex
CREATE UNIQUE INDEX "categorie_nom_categorie_key" ON "public"."categorie"("nom_categorie");

-- CreateIndex
CREATE INDEX "lieu_categorie_id_categorie_idx" ON "public"."lieu_categorie"("id_categorie");

-- CreateIndex
CREATE INDEX "photo_id_lieu_idx" ON "public"."photo"("id_lieu");

-- CreateIndex
CREATE INDEX "avis_id_utilisateur_idx" ON "public"."avis"("id_utilisateur");

-- CreateIndex
CREATE INDEX "avis_id_lieu_idx" ON "public"."avis"("id_lieu");

-- CreateIndex
CREATE INDEX "favori_id_lieu_idx" ON "public"."favori"("id_lieu");

-- AddForeignKey
ALTER TABLE "public"."lieu" ADD CONSTRAINT "lieu_id_quartier_fkey" FOREIGN KEY ("id_quartier") REFERENCES "public"."quartier"("id_quartier") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lieu_categorie" ADD CONSTRAINT "lieu_categorie_id_lieu_fkey" FOREIGN KEY ("id_lieu") REFERENCES "public"."lieu"("id_lieu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lieu_categorie" ADD CONSTRAINT "lieu_categorie_id_categorie_fkey" FOREIGN KEY ("id_categorie") REFERENCES "public"."categorie"("id_categorie") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."photo" ADD CONSTRAINT "photo_id_lieu_fkey" FOREIGN KEY ("id_lieu") REFERENCES "public"."lieu"("id_lieu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."avis" ADD CONSTRAINT "avis_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "public"."utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."avis" ADD CONSTRAINT "avis_id_lieu_fkey" FOREIGN KEY ("id_lieu") REFERENCES "public"."lieu"("id_lieu") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favori" ADD CONSTRAINT "favori_id_utilisateur_fkey" FOREIGN KEY ("id_utilisateur") REFERENCES "public"."utilisateur"("id_utilisateur") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favori" ADD CONSTRAINT "favori_id_lieu_fkey" FOREIGN KEY ("id_lieu") REFERENCES "public"."lieu"("id_lieu") ON DELETE RESTRICT ON UPDATE CASCADE;
