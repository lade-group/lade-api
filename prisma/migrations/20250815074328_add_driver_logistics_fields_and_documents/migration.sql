-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "bankAccount" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "bloodType" TEXT,
ADD COLUMN     "certifications" TEXT,
ADD COLUMN     "curp" TEXT,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "licenseExpiry" TIMESTAMP(3),
ADD COLUMN     "medicalExpiry" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "rfc" TEXT,
ADD COLUMN     "salary" DOUBLE PRECISION,
ADD COLUMN     "specialNotes" TEXT;

-- CreateTable
CREATE TABLE "DriverDocument" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DriverDocument" ADD CONSTRAINT "DriverDocument_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;
