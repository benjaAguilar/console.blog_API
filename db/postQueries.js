import prisma from "./prismaClient.js";
import { tryQuery } from "../lib/tryCatch.js";

const createPost = async (title, cloudUrl, cloudId, ownerId, readtime) => {
    return tryQuery(() => 
        prisma.post.create({
            data: {
                title: title,
                contentUrl: cloudUrl,
                cloudId: cloudId,
                ownerId: ownerId,
                readtimeMin: readtime
            }
        })
    )   
}

const getPosts = async () => {
    return tryQuery(() =>
        prisma.post.findMany({
            include: {
                owner: true
            }
        })
    );
}

const getPostById = async (postId) => {
    return tryQuery(() =>
        prisma.post.findUnique({
            where: {
                id: postId
            }
        })
    );
}

const deletePost = async (postId) => {
    return tryQuery(() => 
        prisma.post.delete({
            where: {
                id: postId
            }
        })
    );
}

const postQueries = {
    createPost,
    getPosts,
    getPostById,
    deletePost
}

export default postQueries;