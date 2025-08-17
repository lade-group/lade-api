-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE', 'REACTIVATE', 'TRANSFER_OWNERSHIP', 'REMOVE_USER', 'LEAVE_TEAM', 'UPLOAD_FILE', 'LOGIN', 'LOGOUT');

-- CreateEnum
CREATE TYPE "LogEntity" AS ENUM ('TEAM', 'USER', 'CLIENT', 'DRIVER', 'VEHICLE', 'TRIP', 'ROUTE', 'ADDRESS', 'CONTACT', 'DOCUMENT');

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "action" "LogAction" NOT NULL,
    "entity" "LogEntity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Log_teamId_idx" ON "Log"("teamId");

-- CreateIndex
CREATE INDEX "Log_userId_idx" ON "Log"("userId");

-- CreateIndex
CREATE INDEX "Log_entity_entityId_idx" ON "Log"("entity", "entityId");

-- CreateIndex
CREATE INDEX "Log_createdAt_idx" ON "Log"("createdAt");

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
