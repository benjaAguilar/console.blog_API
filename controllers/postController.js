import { calculateReadTime, deleteLocalUploads, saveMD } from "../lib/utils.js";
import postQueries from "../db/postQueries.js";
import Errors from "../lib/customError.js";
import { deleteMDfromCloud, uploadMDtoCloud } from "../lib/cloudinary.js";
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
            const file = req.file;
            if(!file) {
                return next(new Errors.customError('File not provided', 400));
            }

            const path = saveMD(file);
        
            if(file.mimetype !== 'text/markdown'){
                deleteLocalUploads(path);
                return next(new Errors.customError('File provided has to be a markdown', 400));
            }
        
            // obtener el readtime
            const readTime = await calculateReadTime(path);
        
            //subir md a clodinary y obtener su secure url
            const result = await uploadMDtoCloud(path, {folder: 'Console.Blog', resource_type: 'raw'});
        
            const { title } = req.body;
            const post = await postQueries.createPost(title, result.secure_url, result.public_id, user.id, readTime);
        
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

const postController = {
    getPosts,
    createPost,
    deletePost,
    updatePost,
    getSinglePost
}

export default postController;