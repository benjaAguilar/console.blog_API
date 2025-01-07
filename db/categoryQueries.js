import { tryQuery } from "../lib/tryCatch.js";
import prisma from "./prismaClient.js";

const getCategories = async () => {
  return tryQuery(() => prisma.category.findMany());
};

const getCategoryByName = async (categoryName) => {
  return tryQuery(() =>
    prisma.category.findFirst({
      where: {
        name: categoryName,
      },
    }),
  );
};

const categoryQueries = {
  getCategories,
  getCategoryByName,
};

export default categoryQueries;
