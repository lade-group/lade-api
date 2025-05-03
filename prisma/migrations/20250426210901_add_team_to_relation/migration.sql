/*
  Warnings:

  - The primary key for the `UsersOnTeams` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "UsersOnTeams" DROP CONSTRAINT "UsersOnTeams_pkey",
ADD CONSTRAINT "UsersOnTeams_pkey" PRIMARY KEY ("userId", "teamId");
