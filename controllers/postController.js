import { calculateReadTime, saveMD } from "../lib/utils.js";
import { v2 as cloudinary } from "cloudinary";
import fs from 'node:fs';
import postQueries from "../db/postQueries.js";
import Errors from "../lib/customError.js";

async function getPosts(req, res, next){
    
    const posts = await postQueries.getPosts();

    res.json({
        success: true,
        posts        
    });
}

async function createPost(req, res, next){
    const user = req.user;
    if(user.role !== "ADMIN") {
        next(new Errors.customError('You dont have permissions to create a post', 401));
    } 

    //obtener el markdown y guardarlo con su nombre
    const file = req.file;
    const path = saveMD(file);

    //subir md a clodinary y obtener su secure url
    const result = await cloudinary.uploader.upload(path, {
        folder: 'Console.Blog',
        resource_type: 'raw'
    });
    
    // TODO MANEJAR ERROR SI FALLA LA SUBIDA A CLOUDINARY

    // obtener el readtime
    const readTime = await calculateReadTime(path);

    //una vez subido se puede eliminar de uploads
    fs.unlink(path, (err) => {
        if(err){
            console.error('Error deleting files on FS');
        }
    });

    const { title } = req.body;
    //guardar datos en la DB
    const post = await postQueries.createPost(title, result.secure_url, result.public_id, user.id, readTime);

    res.json({
        success: true,
        message: 'Post Created!',
        post
    });
}

async function deletePost(req, res, next){
    const user = req.user;
    if(user.role !== "ADMIN") {
        next(new Errors.customError('You dont have permissions to delete a post', 401));
    }

    const postId = parseInt(req.params.postId);

    // obtener la data del post a eliminar 
    const post = await postQueries.getPostById(postId);

    if(!post) return next(new Errors.customError('Post not found', 404));

    // eliminar archivo alojado en cloudinary
    const result = await cloudinary.uploader.destroy(post.cloudId, {resource_type: 'raw'});

    // TODO manejar error en caso de que falle la eliminacion del file

    console.log('CLOUD RESULT! -----------');
    console.log(result);

    // eliminar registro de la DB
    await postQueries.deletePost(postId);

    res.json({
        success: true,
        message: `Post: ${post.title} successfully deleted!`
    })
}

const postController = {
    getPosts,
    createPost,
    deletePost
}

export default postController;