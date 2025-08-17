-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "creditLimit" DOUBLE PRECISION,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "name_related" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentTerms" TEXT,
ADD COLUMN     "preferredPaymentMethod" TEXT,
ADD COLUMN     "specialRequirements" TEXT;
