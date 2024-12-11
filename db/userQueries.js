import prisma from "./prismaClient.js";

async function registerUser(username, password){
    await prisma.user.create({
        data: {
            username: username,
            password: password
        }
    })
}

const userQueries = {
    registerUser
}

export default userQueries;