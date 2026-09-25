-- CreateEnum
CREATE TYPE "TypeOrganisation" AS ENUM ('entreprise', 'nation');

-- CreateEnum
CREATE TYPE "ContexteCommande" AS ENUM ('civil', 'entreprise', 'nation');

-- CreateTable
CREATE TABLE "Organisation" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeOrganisation" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affiliation" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "organisationId" INTEGER NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFin" TIMESTAMP(3),

    CONSTRAINT "Affiliation_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Vente" ADD COLUMN "contexteCommande" "ContexteCommande" NOT NULL DEFAULT 'civil';
ALTER TABLE "Vente" ADD COLUMN "organisationId" INTEGER;

-- Copy existing orgs (same ids)
INSERT INTO "Organisation" ("id", "nom", "type", "createdAt")
SELECT "id", "nom", 'entreprise'::"TypeOrganisation", "createdAt" FROM "EntrepriseCliente";

SELECT setval(pg_get_serial_sequence('"Organisation"', 'id'), COALESCE((SELECT MAX(id) FROM "Organisation"), 1), true);

UPDATE "Organisation" o
SET "type" = 'nation'
WHERE o."id" IN (
  SELECT c."entrepriseClienteId" FROM "Client" c
  WHERE c."typeClient" = 'organisme' AND c."entrepriseClienteId" IS NOT NULL
);

INSERT INTO "Affiliation" ("clientId", "organisationId", "dateDebut")
SELECT c."id", c."entrepriseClienteId", c."createdAt"
FROM "Client" c
WHERE c."entrepriseClienteId" IS NOT NULL;

UPDATE "Vente" v
SET
  "contexteCommande" = CASE c."typeClient"
    WHEN 'entreprise' THEN 'entreprise'::"ContexteCommande"
    WHEN 'organisme' THEN 'nation'::"ContexteCommande"
    ELSE 'civil'::"ContexteCommande"
  END,
  "organisationId" = c."entrepriseClienteId"
FROM "Client" c
WHERE v."clientId" = c."id"
  AND c."typeClient" IN ('entreprise', 'organisme')
  AND c."entrepriseClienteId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "Affiliation_clientId_dateFin_idx" ON "Affiliation"("clientId", "dateFin");

-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Vente" ADD CONSTRAINT "Vente_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
