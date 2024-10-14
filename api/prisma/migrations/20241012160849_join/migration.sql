/*
  Warnings:

  - Added the required column `date` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Join" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL DEFAULT 1,
    "playerId" INTEGER NOT NULL,
    "join" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Join_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Join" ADD CONSTRAINT "Join_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Join" ADD CONSTRAINT "Join_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
