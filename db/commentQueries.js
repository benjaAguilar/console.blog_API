import prisma from "./prismaClient.js";
import { tryQuery } from "../lib/tryCatch.js";

const getComments = async (postId) => {
  return tryQuery(() =>
    prisma.comment.findMany({
      where: {
        postId: postId,
      },
      include: {
        userLikes: true,
        owner: true,
      },
    }),
  );
};

const getCommentById = async (commentId) => {
  return tryQuery(() =>
    prisma.comment.findFirst({
      where: {
        id: commentId,
      },
    }),
  );
};

const createComment = async (content, userId, postId) => {
  return tryQuery(() =>
    prisma.comment.create({
      data: {
        content: content,
        ownerId: userId,
        postId: postId,
      },
    }),
  );
};

const deleteComment = async (commentId) => {
  return tryQuery(() =>
    prisma.comment.delete({
      where: {
        id: commentId,
      },
    }),
  );
};

const updateComment = async (commentId, content) => {
  return tryQuery(() =>
    prisma.comment.update({
      data: {
        content: content,
      },
      where: {
        id: commentId,
      },
    }),
  );
};

const findExistingLike = async (commentId, userId) => {
  return tryQuery(() =>
    prisma.commentLikes.findUnique({
      where: {
        commentId_userId: {
          commentId: commentId,
          userId: userId,
        },
      },
    }),
  );
};

const like = async (commentId, userId) => {
  return tryQuery(() =>
    prisma.commentLikes.create({
      data: {
        comment: { connect: { id: commentId } },
        user: { connect: { id: userId } },
      },
    }),
  );
};

const dislike = async (commentId, userId) => {
  return tryQuery(() =>
    prisma.commentLikes.delete({
      where: {
        commentId_userId: {
          commentId: commentId,
          userId: userId,
        },
      },
    }),
  );
};

const commentQueries = {
  createComment,
  getComments,
  getCommentById,
  deleteComment,
  updateComment,
  findExistingLike,
  like,
  dislike,
};

export default commentQueries;
