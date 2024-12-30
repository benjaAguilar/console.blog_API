-- DropForeignKey
ALTER TABLE "postLikes" DROP CONSTRAINT "postLikes_postId_fkey";

-- AddForeignKey
ALTER TABLE "postLikes" ADD CONSTRAINT "postLikes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
