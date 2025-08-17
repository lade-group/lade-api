-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'PENDING', 'STAMPED', 'CANCELLED', 'ERROR');

-- CreateTable
CREATE TABLE "TeamFiscalData" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "taxSystem" TEXT NOT NULL,
    "fiscalRegime" TEXT,
    "fiscalAddress" JSONB NOT NULL,
    "facturapiOrgId" TEXT,
    "facturapiApiKey" TEXT,
    "defaultPaymentForm" TEXT NOT NULL DEFAULT '28',
    "defaultPaymentMethod" TEXT NOT NULL DEFAULT 'PUE',
    "defaultCfdiUse" TEXT NOT NULL DEFAULT 'G01',
    "defaultProductKey" TEXT NOT NULL DEFAULT '78102200',
    "defaultProductDescription" TEXT NOT NULL DEFAULT 'Servicio de transporte de carga',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamFiscalData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "folio" TEXT,
    "uuid" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "facturapiInvoiceId" TEXT,
    "facturapiPdfUrl" TEXT,
    "facturapiXmlUrl" TEXT,
    "localPdfUrl" TEXT,
    "localXmlUrl" TEXT,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamFiscalData_teamId_key" ON "TeamFiscalData"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_tripId_key" ON "Invoice"("tripId");

-- AddForeignKey
ALTER TABLE "TeamFiscalData" ADD CONSTRAINT "TeamFiscalData_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
