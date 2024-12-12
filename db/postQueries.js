import prisma from "./prismaClient.js";
import { tryQuery } from "../lib/tryCatch.js";

const createPost = async (title, cloudUrl, ownerId, readtime) => {
    return tryQuery(() => 
        prisma.post.create({
            data: {
                title: title,
                contentUrl: cloudUrl,
                ownerId: ownerId,
                readtimeMin: readtime
            }
        })
    )   
}

const postQueries = {
    createPost
}

export default postQueries;