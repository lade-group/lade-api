/*
  Warnings:

  - The primary key for the `TeamInvitation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[email,teamId]` on the table `TeamInvitation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `TeamInvitation` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `TeamInvitation` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "TeamInvitation" DROP CONSTRAINT "TeamInvitation_userId_fkey";

-- AlterTable
ALTER TABLE "TeamInvitation" DROP CONSTRAINT "TeamInvitation_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ADD CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvitation_email_teamId_key" ON "TeamInvitation"("email", "teamId");

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
