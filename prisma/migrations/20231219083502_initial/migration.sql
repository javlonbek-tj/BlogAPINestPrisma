/*
  Warnings:

  - You are about to drop the column `blockingId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `followerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `followingId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `postViewerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `viewerId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_blockingId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_followerId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_followingId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_postViewerId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_viewerId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "blockingId",
DROP COLUMN "followerId",
DROP COLUMN "followingId",
DROP COLUMN "postViewerId",
DROP COLUMN "viewerId";

-- CreateTable
CREATE TABLE "_ViewerToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_UserFollowers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_UserFollowings" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_UserBlockings" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PostViews" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ViewerToUser_AB_unique" ON "_ViewerToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ViewerToUser_B_index" ON "_ViewerToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserFollowers_AB_unique" ON "_UserFollowers"("A", "B");

-- CreateIndex
CREATE INDEX "_UserFollowers_B_index" ON "_UserFollowers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserFollowings_AB_unique" ON "_UserFollowings"("A", "B");

-- CreateIndex
CREATE INDEX "_UserFollowings_B_index" ON "_UserFollowings"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserBlockings_AB_unique" ON "_UserBlockings"("A", "B");

-- CreateIndex
CREATE INDEX "_UserBlockings_B_index" ON "_UserBlockings"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PostViews_AB_unique" ON "_PostViews"("A", "B");

-- CreateIndex
CREATE INDEX "_PostViews_B_index" ON "_PostViews"("B");

-- AddForeignKey
ALTER TABLE "_ViewerToUser" ADD CONSTRAINT "_ViewerToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ViewerToUser" ADD CONSTRAINT "_ViewerToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFollowers" ADD CONSTRAINT "_UserFollowers_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFollowers" ADD CONSTRAINT "_UserFollowers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFollowings" ADD CONSTRAINT "_UserFollowings_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFollowings" ADD CONSTRAINT "_UserFollowings_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserBlockings" ADD CONSTRAINT "_UserBlockings_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserBlockings" ADD CONSTRAINT "_UserBlockings_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostViews" ADD CONSTRAINT "_PostViews_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostViews" ADD CONSTRAINT "_PostViews_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
