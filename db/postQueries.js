import prisma from "./prismaClient.js";
import { tryQuery } from "../lib/tryCatch.js";

const createPost = async (
  title,
  cloudUrl,
  cloudId,
  thumbnailUrl,
  thumbnailId,
  ownerId,
  readtime,
  categories,
) => {
  return tryQuery(() =>
    prisma.post.create({
      data: {
        title: title,
        contentUrl: cloudUrl,
        cloudId: cloudId,
        thumbnailUrl: thumbnailUrl,
        thumbnailId: thumbnailId,
        ownerId: ownerId,
        readtimeMin: readtime,
        categories: {
          create: categories.map((categoryId) => ({ categoryId })),
        },
      },
    }),
  );
};

const getPosts = async () => {
  return tryQuery(() =>
    prisma.post.findMany({
      include: {
        owner: true,
        comments: true,
        userLikes: true,
        categories: true,
      },
    }),
  );
};

const getPostsByCategory = async (categoryId) => {
  return tryQuery(() =>
    prisma.post.findMany({
      where: {
        categories: {
          some: {
            categoryId: categoryId,
          },
        },
      },
      include: {
        userLikes: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    }),
  );
};

const getPostById = async (postId) => {
  return tryQuery(() =>
    prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        userLikes: true,
        comments: true,
        categories: {
          include: {
            category: true,
          },
        },
      },
    }),
  );
};

const deletePost = async (postId) => {
  return tryQuery(() =>
    prisma.post.delete({
      where: {
        id: postId,
      },
    }),
  );
};

const updatePost = async (
  postId,
  title,
  cloudId,
  contentUrl,
  thumbnailId,
  thumbnailUrl,
  readTime,
) => {
  return tryQuery(() =>
    prisma.post.update({
      data: {
        title: title,
        cloudId: cloudId,
        contentUrl: contentUrl,
        thumbnailId: thumbnailId,
        thumbnailUrl: thumbnailUrl,
        readtimeMin: readTime,
      },
      where: {
        id: postId,
      },
    }),
  );
};

const updatePostViews = async (postId) => {
  return tryQuery(() =>
    prisma.post.update({
      data: {
        views: {
          increment: 1,
        },
      },
      where: {
        id: postId,
      },
    }),
  );
};

const findExistingLike = async (postId, userId) => {
  return tryQuery(() =>
    prisma.postLikes.findUnique({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId,
        },
      },
    }),
  );
};

const like = async (postId, userId) => {
  return tryQuery(() =>
    prisma.postLikes.create({
      data: {
        post: { connect: { id: postId } },
        user: { connect: { id: userId } },
      },
    }),
  );
};

const dislike = async (postId, userId) => {
  return tryQuery(() =>
    prisma.postLikes.delete({
      where: {
        postId_userId: {
          postId: postId,
          userId: userId,
        },
      },
    }),
  );
};

const getCategories = async (name) => {
  return tryQuery(() =>
    prisma.category.findFirst({
      where: {
        name: name,
      },
    }),
  );
};

const createCategory = async (name) => {
  return tryQuery(() =>
    prisma.category.create({
      data: {
        name: name,
      },
    }),
  );
};

const deleteCategoriesRelations = async (postId, categories) => {
  return tryQuery(() =>
    prisma.postCategory.deleteMany({
      where: {
        postId: postId,
        categoryId: {
          notIn: categories,
        },
      },
    }),
  );
};

const addNewCategoriesRelations = async (postId, categories) => {
  return tryQuery(
    async () =>
      await Promise.all(
        categories.map((categoryId) =>
          prisma.postCategory.upsert({
            where: {
              postId_categoryId: { postId, categoryId }, // Composite key
            },
            update: {}, // No se necesita actualizar nada si ya existe
            create: { postId, categoryId }, // Crea la relación si no existe
          }),
        ),
      ),
  );
};

const postQueries = {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  updatePost,
  updatePostViews,
  findExistingLike,
  like,
  dislike,
  getCategories,
  createCategory,
  deleteCategoriesRelations,
  addNewCategoriesRelations,
  getPostsByCategory,
};

export default postQueries;
