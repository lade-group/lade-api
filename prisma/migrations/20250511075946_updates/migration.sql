/*
  Warnings:

  - The primary key for the `Address` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Client` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `real_name` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `reference_name` on the `Client` table. All the data in the column will be lost.
  - The primary key for the `Contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Team` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UsersOnTeams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[joinCode]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addressId` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cfdiUse` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxRegime` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContactType" ADD VALUE 'FAX';
ALTER TYPE "ContactType" ADD VALUE 'OTHER';

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_clientId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_addressId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnTeams" DROP CONSTRAINT "UsersOnTeams_teamId_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnTeams" DROP CONSTRAINT "UsersOnTeams_userId_fkey";

-- DropIndex
DROP INDEX "Client_rfc_key";

-- AlterTable
ALTER TABLE "Address" DROP CONSTRAINT "Address_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Address_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Address_id_seq";

-- AlterTable
ALTER TABLE "Client" DROP CONSTRAINT "Client_pkey",
DROP COLUMN "real_name",
DROP COLUMN "reference_name",
ADD COLUMN     "addressId" TEXT NOT NULL,
ADD COLUMN     "cfdiUse" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "taxRegime" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "zipCode" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "teamId" SET DATA TYPE TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ADD CONSTRAINT "Client_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Client_id_seq";

-- AlterTable
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "value" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "clientId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Contact_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Contact_id_seq";

-- AlterTable
ALTER TABLE "Team" DROP CONSTRAINT "Team_pkey",
ADD COLUMN     "joinCode" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "addressId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Team_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Team_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "UsersOnTeams" DROP CONSTRAINT "UsersOnTeams_pkey",
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "teamId" SET DATA TYPE TEXT,
ADD CONSTRAINT "UsersOnTeams_pkey" PRIMARY KEY ("userId", "teamId");

-- CreateTable
CREATE TABLE "TeamInvitation" (
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("userId","teamId")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_teamId_key" ON "Subscription"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_joinCode_key" ON "Team"("joinCode");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnTeams" ADD CONSTRAINT "UsersOnTeams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnTeams" ADD CONSTRAINT "UsersOnTeams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
