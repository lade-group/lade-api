/*
  Warnings:

  - Added the required column `year` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "vin" TEXT,
ADD COLUMN     "year" INTEGER NOT NULL;
