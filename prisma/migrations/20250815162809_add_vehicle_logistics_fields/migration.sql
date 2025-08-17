-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "capacity" TEXT,
ADD COLUMN     "fuelType" TEXT,
ADD COLUMN     "insuranceExpiry" TIMESTAMP(3),
ADD COLUMN     "insuranceNumber" TEXT,
ADD COLUMN     "lastMaintenance" TIMESTAMP(3),
ADD COLUMN     "mileage" DOUBLE PRECISION,
ADD COLUMN     "nextMaintenance" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "registrationExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "VehicleDocument" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
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

    CONSTRAINT "VehicleDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleMaintenance" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DOUBLE PRECISION,
    "mileage" DOUBLE PRECISION,
    "workshop" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleMaintenance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VehicleDocument" ADD CONSTRAINT "VehicleDocument_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleMaintenance" ADD CONSTRAINT "VehicleMaintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
