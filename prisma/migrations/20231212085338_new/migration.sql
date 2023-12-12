/*
  Warnings:

  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `photo` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_postId_fkey";

-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_userId_fkey";

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "photo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilPhoto" TEXT;

-- DropTable
DROP TABLE "Image";
