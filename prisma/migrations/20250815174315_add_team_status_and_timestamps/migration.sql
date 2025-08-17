/*
  Warnings:

  - Added the required column `updatedAt` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "TeamStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
