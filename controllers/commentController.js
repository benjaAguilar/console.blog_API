import commentQueries from "../db/commentQueries.js";
import postQueries from "../db/postQueries.js";
import { validationResult } from "express-validator";
import validator from "../config/validator.js";
import Errors from "../lib/customError.js";
import tryCatch from "../lib/tryCatch.js";

async function getComments(req, res) {
  const postId = parseInt(req.params.postId);
  const comments = await commentQueries.getComments(postId);

  res.json({
    success: true,
    comments,
  });
}

const createComment = [
  validator.validateComment,
  tryCatch(async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return next(
        new Errors.validationError(
          req.message.fail.invalidFields,
          400,
          validationErrors.array(),
        ),
      );
    }

    const user = req.user;
    const postId = parseInt(req.params.postId);

    const post = await postQueries.getPostById(postId);

    if (!post) {
      return next(new Errors.customError(req.message.fail.postNotFound, 404));
    }

    const { content } = req.body;
    const comment = await commentQueries.createComment(
      content,
      user.id,
      postId,
    );

    res.json({
      success: true,
      message: req.message.success.createdComment,
      comment,
    });
  }),
];

async function deleteComment(req, res, next) {
  const user = req.user;
  const commentId = parseInt(req.params.commentId);

  const comment = await commentQueries.getCommentById(commentId);

  if (!comment) {
    return next(new Errors.customError(req.message.fail.commentNotFound, 404));
  }

  if (comment.ownerId !== user.id && user.role !== "ADMIN") {
    return next(
      new Errors.customError(req.message.fail.unauthorizedToDeleteComment, 401),
    );
  }

  const delComment = await commentQueries.deleteComment(commentId);

  res.json({
    success: true,
    message: req.message.success.deletedComment,
    delComment,
  });
}

const updateComment = [
  validator.validateComment,
  tryCatch(async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return next(
        new Errors.validationError(
          req.message.fail.invalidFields,
          400,
          validationErrors.array(),
        ),
      );
    }

    const user = req.user;
    const commentId = parseInt(req.params.commentId);

    const comment = await commentQueries.getCommentById(commentId);

    if (!comment) {
      return next(
        new Errors.customError(req.message.fail.commentNotFound, 404),
      );
    }

    if (comment.ownerId !== user.id) {
      return next(
        new Errors.customError(req.message.fail.unauthorizedToEditComment, 401),
      );
    }

    const { content } = req.body;
    const updatedComment = await commentQueries.updateComment(
      commentId,
      content,
    );

    res.json({
      success: true,
      message: req.message.success.updatedComment,
      updatedComment,
    });
  }),
];

async function updateLikeComment(req, res, next) {
  let msg = req.message.success.liked;

  const user = req.user;
  const commentId = parseInt(req.params.commentId);

  const [liked, comment] = await Promise.all([
    commentQueries.findExistingLike(commentId, user.id),
    commentQueries.getCommentById(commentId),
  ]);

  if (!comment) {
    return next(new Errors.customError(req.message.fail.commentNotFound, 404));
  }

  if (!liked) {
    await commentQueries.like(commentId, user.id);
  } else {
    await commentQueries.dislike(commentId, user.id);
    msg = req.message.success.disliked;
  }

  res.json({
    success: true,
    message: msg,
  });
}

const commentController = {
  getComments,
  createComment,
  deleteComment,
  updateComment,
  updateLikeComment,
};

export default commentController;
