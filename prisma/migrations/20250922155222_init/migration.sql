-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Lieu" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "adresse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lieu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Categorie" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Categorie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LieuCategorie" (
    "lieuId" INTEGER NOT NULL,
    "categorieId" INTEGER NOT NULL,

    CONSTRAINT "LieuCategorie_pkey" PRIMARY KEY ("lieuId","categorieId")
);

-- CreateTable
CREATE TABLE "public"."Photo" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "lieuId" INTEGER NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Avis" (
    "id" SERIAL NOT NULL,
    "contenu" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "lieuId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Favori" (
    "userId" INTEGER NOT NULL,
    "lieuId" INTEGER NOT NULL,

    CONSTRAINT "Favori_pkey" PRIMARY KEY ("userId","lieuId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Categorie_label_key" ON "public"."Categorie"("label");

-- AddForeignKey
ALTER TABLE "public"."LieuCategorie" ADD CONSTRAINT "LieuCategorie_lieuId_fkey" FOREIGN KEY ("lieuId") REFERENCES "public"."Lieu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LieuCategorie" ADD CONSTRAINT "LieuCategorie_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "public"."Categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Photo" ADD CONSTRAINT "Photo_lieuId_fkey" FOREIGN KEY ("lieuId") REFERENCES "public"."Lieu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Avis" ADD CONSTRAINT "Avis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Avis" ADD CONSTRAINT "Avis_lieuId_fkey" FOREIGN KEY ("lieuId") REFERENCES "public"."Lieu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favori" ADD CONSTRAINT "Favori_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Favori" ADD CONSTRAINT "Favori_lieuId_fkey" FOREIGN KEY ("lieuId") REFERENCES "public"."Lieu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
