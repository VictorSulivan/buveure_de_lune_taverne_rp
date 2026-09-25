-- Rename finance tables from Gringotts to Banque
ALTER TABLE "Gringotts" RENAME TO "Banque";
ALTER TABLE "TransactionGringotts" RENAME TO "TransactionBanque";

ALTER INDEX "Gringotts_pkey" RENAME TO "Banque_pkey";
ALTER INDEX "Gringotts_entrepriseId_key" RENAME TO "Banque_entrepriseId_key";
ALTER INDEX "TransactionGringotts_pkey" RENAME TO "TransactionBanque_pkey";

ALTER TABLE "Banque" RENAME CONSTRAINT "Gringotts_entrepriseId_fkey" TO "Banque_entrepriseId_fkey";
ALTER TABLE "TransactionBanque" RENAME CONSTRAINT "TransactionGringotts_employeId_fkey" TO "TransactionBanque_employeId_fkey";
ALTER TABLE "TransactionBanque" RENAME CONSTRAINT "TransactionGringotts_venteId_fkey" TO "TransactionBanque_venteId_fkey";
