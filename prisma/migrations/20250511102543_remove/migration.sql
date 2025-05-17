/*
  Warnings:

  - You are about to drop the column `userId` on the `TeamInvitation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TeamInvitation" DROP CONSTRAINT "TeamInvitation_userId_fkey";

-- AlterTable
ALTER TABLE "TeamInvitation" DROP COLUMN "userId";
