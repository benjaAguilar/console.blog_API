-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "thumbnailId" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT NOT NULL DEFAULT '/defaultThumbnail.webp';
