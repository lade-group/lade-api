-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'DELETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE';
