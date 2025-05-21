/*
  Warnings:

  - You are about to drop the `DriverContact` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_clientId_fkey";

-- DropForeignKey
ALTER TABLE "DriverContact" DROP CONSTRAINT "DriverContact_driverId_fkey";

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "driverId" TEXT,
ALTER COLUMN "clientId" DROP NOT NULL;

-- DropTable
DROP TABLE "DriverContact";

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
