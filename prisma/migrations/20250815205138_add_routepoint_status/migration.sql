/*
  Warnings:

  - Added the required column `updatedAt` to the `RoutePoint` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RoutePointStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- AlterTable
ALTER TABLE "RoutePoint" ADD COLUMN     "status" "RoutePointStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
