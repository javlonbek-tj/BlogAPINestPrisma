-- AlterTable
ALTER TABLE "User" ALTER COLUMN "activationCode" DROP NOT NULL,
ALTER COLUMN "activationCodeExpires" DROP NOT NULL;
