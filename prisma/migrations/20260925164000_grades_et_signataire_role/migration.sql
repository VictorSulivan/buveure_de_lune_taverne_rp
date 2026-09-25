-- AlterEnum
ALTER TYPE "RoleEmploye" ADD VALUE 'admin';

-- AlterTable
ALTER TABLE "Contrat" ADD COLUMN "signataireRole" TEXT;
