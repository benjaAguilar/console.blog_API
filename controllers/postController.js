import { calculateReadTime, saveMD } from "../lib/utils.js";
import { v2 as cloudinary } from "cloudinary";
import fs from 'node:fs';
import postQueries from "../db/postQueries.js";
import Errors from "../lib/customError.js";

async function getPosts(req, res, next){
    res.json({cheers: 'Hello to posts API'});
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
    const post = await postQueries.createPost(title, result.secure_url, user.id, readTime);

    res.json({
        success: true,
        message: 'Post Created!',
        post
    });
}

const postController = {
    getPosts,
    createPost
}

export default postController;