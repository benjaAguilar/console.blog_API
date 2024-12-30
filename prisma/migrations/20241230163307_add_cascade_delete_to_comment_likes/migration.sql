-- DropForeignKey
ALTER TABLE "commentLikes" DROP CONSTRAINT "commentLikes_commentId_fkey";

-- AddForeignKey
ALTER TABLE "commentLikes" ADD CONSTRAINT "commentLikes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
