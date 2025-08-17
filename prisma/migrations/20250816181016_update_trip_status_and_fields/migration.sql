/*
  Warnings:

  - The values [PREINICIALIZADO,FINALIZADO_TARDIO] on the enum `TripStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TripStatus_new" AS ENUM ('NO_INICIADO', 'EN_PROCESO', 'FINALIZADO_A_TIEMPO', 'FINALIZADO_CON_RETRASO', 'CANCELADO');
ALTER TABLE "Trip" ALTER COLUMN "status" TYPE "TripStatus_new" USING ("status"::text::"TripStatus_new");
ALTER TYPE "TripStatus" RENAME TO "TripStatus_old";
ALTER TYPE "TripStatus_new" RENAME TO "TripStatus";
DROP TYPE "TripStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "notes" TEXT,
ALTER COLUMN "status" SET DEFAULT 'NO_INICIADO';
