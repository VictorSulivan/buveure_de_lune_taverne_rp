-- CreateTable
CREATE TABLE "PaiementSalaire" (
    "id" SERIAL NOT NULL,
    "employeId" INTEGER NOT NULL,
    "semaineDebut" TIMESTAMP(3) NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaiementSalaire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaiementSalaire_employeId_semaineDebut_key" ON "PaiementSalaire"("employeId", "semaineDebut");

-- AddForeignKey
ALTER TABLE "PaiementSalaire" ADD CONSTRAINT "PaiementSalaire_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
