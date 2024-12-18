import commentQueries from "../db/commentQueries.js";
import validator from "../config/validator.js";
import Errors from "../lib/customError.js";
import tryCatch from "../lib/tryCatch.js";

async function getComments(req, res, next){
    const postId = parseInt(req.params.postId);
    const comments = await commentQueries.getComments(postId);

    res.json({
        success: true, 
        comments
    });
}

const createComment = [
    validator.validateComment,
    tryCatch(
        async (req, res, next) => {
            const validationErrors = validationResult(req);
            if(!validationErrors.isEmpty()){
                return next(
                    new Errors.validationError('Invalid field', 400, validationErrors.array())
                );
            }

            const user = req.user;
            const postId = parseInt(req.params.postId);
        
            const { content } = req.body;
            const comment = await commentQueries.createComment(content, user.id, postId);
        
            res.json({
                success: true,
                message: 'Commented!',
                comment
            });
        }
    )
]

async function deleteComment(req, res, next){
    const user = req.user;
    const commentId = parseInt(req.params.commentId);

    const comment = await commentQueries.getCommentById(commentId);

    if(!comment){
        return next(new Errors.customError('Comment not found', 404));
    }

    if(comment.ownerId !== user.id && user.role !== 'ADMIN'){
        return next(new Errors.customError('You dont have permissions to delete this comment', 401));
    }

    const delComment = await commentQueries.deleteComment(commentId);

    res.json({
        success: true,
        message: 'Comment Deleted!',
        delComment
    });
}

const updateComment = [
    validator.validateComment,
    tryCatch(
        async (req, res, next) => {
            const validationErrors = validationResult(req);
            if(!validationErrors.isEmpty()){
                return next(
                    new Errors.validationError('Invalid field', 400, validationErrors.array())
                );
            }

            const user = req.user;
            const commentId = parseInt(req.params.commentId);
        
            const comment = await commentQueries.getCommentById(commentId);
        
            if(!comment){
                return next(new Errors.customError('Comment not found', 404));
            }
        
            if(comment.ownerId !== user.id){
                return next(new Errors.customError('You dont have permissions to edit this comment', 401));
            }
        
            const { content } = req.body;
            const updatedComment = await commentQueries.updateComment(commentId, content);
        
            res.json({
                success: true,
                message: 'Comment Updated!',
                updatedComment
            });
        }
    )
]

const commentController = {
    getComments,
    createComment,
    deleteComment,
    updateComment
}

export default commentController;