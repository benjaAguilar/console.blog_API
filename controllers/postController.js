import { calculateReadTime, deleteLocalUploads, saveMD } from "../lib/utils.js";
import postQueries from "../db/postQueries.js";
import Errors from "../lib/customError.js";
import { deleteMDfromCloud, uploadImgtoCloud, uploadMDtoCloud } from "../lib/cloudinary.js";
import { validationResult } from 'express-validator';
import validator from "../config/validator.js";
import tryCatch from "../lib/tryCatch.js";

async function getPosts(req, res, next){
    
    const posts = await postQueries.getPosts();

    res.json({
        success: true,
        posts        
    });
}

async function getSinglePost(req, res, next){
    const postId = parseInt(req.params.postId);

    const post = await postQueries.getPostById(postId);
    if(!post){
        return next(new Errors.customError('Post not found', 404));
    }
    
    await postQueries.updatePostViews(postId);

    res.json({
        success: true,
        post
    });
}

const createPost = [
    validator.validatePostTitle,
    tryCatch(
        async (req, res, next) => {
            const validationErrors = validationResult(req);
            if(!validationErrors.isEmpty()){
                return next(
                    new Errors.validationError('Invalid field', 400, validationErrors.array())
                );
            }

            const user = req.user;
            if(user.role !== "ADMIN") {
                return next(new Errors.customError('You dont have permissions to create a post', 401));
            } 
        
            //obtener el markdown y guardarlo con su nombre
            const file = req.files['post'] ? req.files['post'][0] : null;
            const thumbnailImage = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

            if(!file) {
                return next(new Errors.customError('File not provided', 400));
            }

            const filePath = saveMD(file);
            let thumbnailPath = '/defaultThumbnail.webp';

            if(thumbnailImage){
                thumbnailPath = saveMD(thumbnailImage);
                if(!thumbnailImage.mimetype.startsWith('image/')){
                    deleteLocalUploads(filePath);
                    if(thumbnailImage) deleteLocalUploads(thumbnailPath);
                    return next(new Errors.customError('Thumbnail provided has to be an image', 400));
                }
            }
        
            if(file.mimetype !== 'text/markdown'){
                deleteLocalUploads(filePath);
                if(thumbnailImage) deleteLocalUploads(thumbnailPath);
                return next(new Errors.customError('File provided has to be a markdown', 400));
            }
        
            // obtener el readtime
            const readTime = await calculateReadTime(filePath);
        
            //subir md a clodinary y obtener su secure url
            const [ fileResult, thumbnailResult ] = await Promise.all([
                uploadMDtoCloud(filePath, {folder: 'Console.Blog', resource_type: 'raw'}),
                uploadImgtoCloud(thumbnailPath, {folder: 'Console.Blog', resource_type: 'image'})
            ]);
        
            const { title } = req.body;
            const post = await postQueries.createPost(
                title,
                fileResult.secure_url, 
                fileResult.public_id,
                thumbnailResult.secure_url,
                thumbnailResult.public_id,
                user.id,
                readTime
            );
        
            res.json({
                success: true,
                message: 'Post Created!',
                post
            });
        }
    )
]

const updatePost = [
    validator.validatePostTitle,
    tryCatch(
        async (req, res, next) => {
            const validationErrors = validationResult(req);
            if(!validationErrors.isEmpty()){
                return next(
                    new Errors.validationError('Invalid field', 400, validationErrors.array())
                );
            }

            const user = req.user;
            if(user.role !== "ADMIN") {
                return next(new Errors.customError('You dont have permissions to update a post', 401));
            }
        
            const postId = parseInt(req.params.postId);
        
            const post = await postQueries.getPostById(postId);
            if(!post) return next(new Errors.customError('Post not found', 404));
        
            const file = req.file;
            if(!file) {
                return next(new Errors.customError('File not provided', 400));
            }
            
            const path = saveMD(file);
        
            if(file.mimetype !== 'text/markdown'){
                deleteLocalUploads(path);
                return next(new Errors.customError('File provided has to be a markdown', 400));
            }
        
            const readTime = await calculateReadTime(path);
        
            // subir post nuevo a cloudinary
            const result = await uploadMDtoCloud(path, {folder: 'Console.Blog', resource_type: 'raw'});
        
            // update en la DB
            const { title } = req.body;
            await postQueries.updatePost(post.id, title, result.public_id, result.secure_url, readTime)
        
            // eliminar archivo perdido en cloudinary
            await deleteMDfromCloud(post.cloudId, {resource_type: 'raw'});
        
            res.json({
                success: true,
                message: `Post ${title} Successfully updated!`
            });
        }
    )
]

async function deletePost(req, res, next){
    const user = req.user;
    if(user.role !== "ADMIN") {
        return next(new Errors.customError('You dont have permissions to delete a post', 401));
    }

    const postId = parseInt(req.params.postId);

    // obtener la data del post a eliminar 
    const post = await postQueries.getPostById(postId);

    if(!post) return next(new Errors.customError('Post not found', 404));

    // eliminar archivo alojado en cloudinary
    await deleteMDfromCloud(post.cloudId, {resource_type: 'raw'});

    // eliminar registro de la DB
    await postQueries.deletePost(postId);

    res.json({
        success: true,
        message: `Post: ${post.title} successfully deleted!`
    });
}

async function updateLikePost(req, res, next){
    let msg = 'Liked!';

    const user = req.user;
    const postId = parseInt(req.params.postId);

    const [ liked, post ] = await Promise.all([
        postQueries.findExistingLike(postId, user.id),
        postQueries.getPostById(postId)
    ]);
    
    if(!post){
        return next(new Errors.customError('Post not found', 404));
    }

    if(!liked) {
        await postQueries.like(postId, user.id);

    } else {
        await postQueries.dislike(postId, user.id);
        msg = 'Disliked!';

    }

    res.json({
        success: true,
        message: msg
    });
}

const postController = {
    getPosts,
    createPost,
    deletePost,
    updatePost,
    getSinglePost,
    updateLikePost
}

export default postController;