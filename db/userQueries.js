import prisma from "./prismaClient.js";

async function registerUser(username, password){
    await prisma.user.create({
        data: {
            username: username,
            password: password
        }
    })
}

async function getUserByName(username){
    const user = await prisma.user.findUnique({
        where: {
            username: username
        }
    });

    return user;
}

const userQueries = {
    registerUser,
    getUserByName
}

export default userQueries;