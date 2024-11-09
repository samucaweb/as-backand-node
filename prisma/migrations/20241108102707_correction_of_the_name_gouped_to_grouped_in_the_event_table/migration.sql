/*
  Warnings:

  - You are about to drop the column `gouped` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "gouped",
ADD COLUMN     "grouped" BOOLEAN NOT NULL DEFAULT false;
