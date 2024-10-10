/*
  Warnings:

  - You are about to drop the column `images` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Team` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "images",
ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "images",
ADD COLUMN     "image" TEXT;
