-- CreateEnum
CREATE TYPE "Lang" AS ENUM ('ES', 'EN');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "lang" "Lang" NOT NULL DEFAULT 'ES';
