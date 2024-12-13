import { Router } from "express";
import postController from '../controllers/postController.js';
import tryCatch from '../lib/tryCatch.js';
import upload from '../config/multer.js';
import passport from "passport";

const router = Router();

router.get('/', postController.getPosts);

router.post(
    '/', 
    passport.authenticate('jwt', {session: false}), 
    upload.single('post'), 
    tryCatch(postController.createPost)
);

router.delete(
    '/:postId', 
    passport.authenticate('jwt', {session: false}), 
    tryCatch(postController.deletePost)
);

router.put(
    '/:postId',
    passport.authenticate('jwt', {session: false}),
    upload.single('post'),
    tryCatch(postController.updatePost)
)

export default router;

