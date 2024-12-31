import prisma from "./prismaClient.js";
import { tryQuery } from "../lib/tryCatch.js";

const registerUser = async (username, password) => {
  return await tryQuery(() =>
    prisma.user.create({
      data: {
        username: username,
        password: password,
      },
    }),
  );
};

const getUserByName = async (username) => {
  return await tryQuery(() =>
    prisma.user.findUnique({
      where: {
        username: username,
      },
    }),
  );
};

const userQueries = {
  registerUser,
  getUserByName,
};

export default userQueries;
