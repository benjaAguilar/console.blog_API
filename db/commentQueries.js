import prisma from "./prismaClient.js";
import { tryQuery } from "../lib/tryCatch.js";

const getComments = async (postId) => {
    return tryQuery(() =>
        prisma.comment.findMany({
            where: {
                postId: postId
            }
        })
    );
}

const getCommentById = async (commentId) => {
    return tryQuery(() =>
        prisma.comment.findFirst({
            where: {
                id: commentId
            }
        })
    );
}

const createComment = async (content, userId, postId) => {
    return tryQuery(() =>
        prisma.comment.create({
            data: {
                content: content,
                ownerId: userId,
                postId: postId
            }
        })
    );
}

const deleteComment = async (commentId) => {
    return tryQuery(() => 
        prisma.comment.delete({
            where: {
                id: commentId
            }
        })
    );
}

const commentQueries = {
    createComment,
    getComments,
    getCommentById,
    deleteComment
}

export default commentQueries;