/*
  Warnings:

  - You are about to drop the column `image` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Team` table. All the data in the column will be lost.
  - Added the required column `images` to the `Player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `images` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" DROP COLUMN "image",
ADD COLUMN     "images" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "image",
ADD COLUMN     "images" TEXT NOT NULL,
ADD COLUMN     "teamId" TEXT NOT NULL;
