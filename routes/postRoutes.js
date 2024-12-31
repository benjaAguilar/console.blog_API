import { Router } from "express";
import postController from '../controllers/postController.js';
import tryCatch from '../lib/tryCatch.js';
import upload from '../config/multer.js';
import passport from "passport";
import commentController from "../controllers/commentController.js";

const router = Router();

router.get('/', tryCatch(postController.getPosts));

router.get('/:postId', tryCatch(postController.getSinglePost));

router.post(
    '/', 
    passport.authenticate('jwt', {session: false}), 
    upload.fields([
        { name: 'post', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]), 
    postController.createPost
);

router.delete(
    '/:postId', 
    passport.authenticate('jwt', {session: false}), 
    tryCatch(postController.deletePost)
);

router.put(
    '/:postId',
    passport.authenticate('jwt', {session: false}),
    upload.fields([
        { name: 'post', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]), 
    postController.updatePost
);

router.put(
    '/:postId/like',
    passport.authenticate('jwt', {session: false}),
    tryCatch(postController.updateLikePost)
);

//COMMENTS
router.get(
    '/:postId/comments',
    tryCatch(commentController.getComments)
);

router.post(
     '/:postId/comments',
     passport.authenticate('jwt', {session: false}),
     commentController.createComment
);

router.delete(
    '/comments/:commentId',
    passport.authenticate('jwt', {session: false}),
    tryCatch(commentController.deleteComment)
);

router.put(
    '/comments/:commentId',
    passport.authenticate('jwt', {session: false}),
    commentController.updateComment
);

router.put(
    '/comments/:commentId/like',
    passport.authenticate('jwt', {session: false}),
    tryCatch(commentController.updateLikeComment)
)

export default router;

