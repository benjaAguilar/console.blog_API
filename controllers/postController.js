import { calculateReadTime, deleteLocalUploads, saveMD } from "../lib/utils.js";
import postQueries from "../db/postQueries.js";
import Errors from "../lib/customError.js";
import {
  deleteMDfromCloud,
  uploadImgtoCloud,
  uploadMDtoCloud,
} from "../lib/cloudinary.js";
import { validationResult } from "express-validator";
import validator from "../config/validator.js";
import tryCatch from "../lib/tryCatch.js";
import categoryQueries from "../db/categoryQueries.js";
import slugify from "slugify";

async function getPosts(req, res) {
  const { category } = req.query;
  let categoryQuery;
  let posts;

  if (category) {
    categoryQuery = await categoryQueries.getCategoryByName(category);
  }

  if (categoryQuery) {
    posts = await postQueries.getPostsByCategory(categoryQuery.id);
  } else {
    posts = await postQueries.getPosts();
  }

  res.json({
    success: true,
    posts,
  });
}

async function getSinglePost(req, res, next) {
  const postId = parseInt(req.params.postId);

  const post = await postQueries.getPostById(postId);
  if (!post) {
    return next(new Errors.customError("Post not found", 404));
  }

  await postQueries.updatePostViews(postId);

  res.json({
    success: true,
    post,
  });
}

async function getPostBySlug(req, res, next) {
  const slug = req.params.slug;

  const post = await postQueries.getPostBySlug(slug);
  if (!post) {
    return next(new Errors.customError("Post not found", 404));
  }

  await postQueries.updatePostViews(post.id);

  res.json({
    success: true,
    post,
  });
}

const createPost = [
  validator.validatePostTitle,
  tryCatch(async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return next(
        new Errors.validationError(
          "Invalid field",
          400,
          validationErrors.array(),
        ),
      );
    }

    const user = req.user;
    if (user.role !== "ADMIN") {
      return next(
        new Errors.customError(
          "You dont have permissions to create a post",
          401,
        ),
      );
    }

    //obtener el markdown y guardarlo con su nombre
    const file = req.files["post"] ? req.files["post"][0] : null;
    const thumbnailImage = req.files["thumbnail"]
      ? req.files["thumbnail"][0]
      : null;

    if (!file) {
      return next(new Errors.customError("File not provided", 400));
    }

    const filePath = saveMD(file);
    let thumbnailPath = "/defaultThumbnail.webp";

    if (thumbnailImage) {
      thumbnailPath = saveMD(thumbnailImage);
      if (!thumbnailImage.mimetype.startsWith("image/")) {
        deleteLocalUploads(filePath);
        if (thumbnailImage) deleteLocalUploads(thumbnailPath);
        return next(
          new Errors.customError("Thumbnail provided has to be an image", 400),
        );
      }
    }

    if (file.mimetype !== "text/markdown") {
      deleteLocalUploads(filePath);
      if (thumbnailImage) deleteLocalUploads(thumbnailPath);
      return next(
        new Errors.customError("File provided has to be a markdown", 400),
      );
    }

    // obtener el readtime
    const readTime = await calculateReadTime(filePath);

    //subir md a clodinary y obtener su secure url
    const [fileResult, thumbnailResult] = await Promise.all([
      uploadMDtoCloud(filePath, {
        folder: "Console.Blog",
        resource_type: "raw",
      }),
      uploadImgtoCloud(thumbnailPath, {
        folder: "Console.Blog",
        resource_type: "image",
      }),
    ]);

    const { title } = req.body;
    const slug = slugify(title);
    let categoryNames = req.body.categoryNames;

    if (!categoryNames || categoryNames === "") {
      categoryNames = ["other"];
    } else {
      categoryNames = categoryNames.split(" ");
    }

    //get categories
    const categories = await Promise.all(
      categoryNames.map(async (name) => {
        const lowerCaseName = name.toLowerCase();
        let category = await postQueries.getCategories(lowerCaseName);
        if (!category) {
          category = await postQueries.createCategory(lowerCaseName);
        }
        return category.id;
      }),
    );

    const post = await postQueries.createPost(
      title,
      slug,
      fileResult.secure_url,
      fileResult.public_id,
      thumbnailResult.secure_url,
      thumbnailResult.public_id,
      user.id,
      readTime,
      categories,
    );

    res.json({
      success: true,
      message: "Post Created!",
      post,
    });
  }),
];

const updatePost = [
  validator.validatePostTitle,
  tryCatch(async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return next(
        new Errors.validationError(
          "Invalid field",
          400,
          validationErrors.array(),
        ),
      );
    }

    const user = req.user;
    if (user.role !== "ADMIN") {
      return next(
        new Errors.customError(
          "You dont have permissions to update a post",
          401,
        ),
      );
    }

    const postId = parseInt(req.params.postId);

    const post = await postQueries.getPostById(postId);
    if (!post) return next(new Errors.customError("Post not found", 404));

    const file = req.files["post"] ? req.files["post"][0] : null;
    const thumbnailImage = req.files["thumbnail"]
      ? req.files["thumbnail"][0]
      : null;

    if (!file) {
      return next(new Errors.customError("File not provided", 400));
    }

    const filePath = saveMD(file);
    let thumbnailPath = post.thumbnailUrl;

    if (thumbnailImage) {
      thumbnailPath = saveMD(thumbnailImage);
      if (!thumbnailImage.mimetype.startsWith("image/")) {
        deleteLocalUploads(filePath);
        if (thumbnailImage) deleteLocalUploads(thumbnailPath);
        return next(
          new Errors.customError("Thumbnail provided has to be an image", 400),
        );
      }
    }

    if (file.mimetype !== "text/markdown") {
      deleteLocalUploads(filePath);
      return next(
        new Errors.customError("File provided has to be a markdown", 400),
      );
    }

    const readTime = await calculateReadTime(filePath);

    // subir post nuevo a cloudinary
    const [fileResult, thumbnailResult] = await Promise.all([
      uploadMDtoCloud(filePath, {
        folder: "Console.Blog",
        resource_type: "raw",
      }),
      uploadImgtoCloud(
        thumbnailPath,
        { folder: "Console.Blog", resource_type: "image" },
        { path: post.thumbnailUrl, id: post.thumbnailId },
      ),
    ]);

    // update en la DB
    const { title } = req.body;
    const slug = slugify(title);
    let categoryNames = req.body.categoryNames;

    if (!categoryNames || categoryNames === "") {
      categoryNames = ["other"];
    } else {
      categoryNames = categoryNames.split(" ");
    }

    //get categories
    const categories = await Promise.all(
      categoryNames.map(async (name) => {
        const lowerCaseName = name.toLowerCase();
        let category = await postQueries.getCategories(lowerCaseName);
        if (!category) {
          category = await postQueries.createCategory(lowerCaseName);
        }
        return category.id;
      }),
    );

    await postQueries.updatePost(
      post.id,
      title,
      slug,
      fileResult.public_id,
      fileResult.secure_url,
      thumbnailResult.public_id,
      thumbnailResult.secure_url,
      readTime,
    );
    await postQueries.deleteCategoriesRelations(post.id, categories);
    await postQueries.addNewCategoriesRelations(postId, categories);

    // eliminar archivo perdido en cloudinary
    if (
      thumbnailResult.public_id !== post.thumbnailId &&
      thumbnailResult.public_id &&
      post.thumbnailId
    ) {
      await Promise.all([
        deleteMDfromCloud(post.thumbnailId, { resource_type: "image" }),
        deleteMDfromCloud(post.cloudId, { resource_type: "raw" }),
      ]);
    } else {
      await deleteMDfromCloud(post.cloudId, { resource_type: "raw" });
    }

    res.json({
      success: true,
      message: `Post ${title} Successfully updated!`,
    });
  }),
];

async function deletePost(req, res, next) {
  const user = req.user;
  if (user.role !== "ADMIN") {
    return next(
      new Errors.customError("You dont have permissions to delete a post", 401),
    );
  }

  const postId = parseInt(req.params.postId);

  // obtener la data del post a eliminar
  const post = await postQueries.getPostById(postId);

  if (!post) return next(new Errors.customError("Post not found", 404));

  // eliminar archivo alojado en cloudinary
  if (post.thumbnailId) {
    await Promise.all([
      deleteMDfromCloud(post.thumbnailId, { resource_type: "image" }),
      deleteMDfromCloud(post.cloudId, { resource_type: "raw" }),
    ]);
  } else {
    await deleteMDfromCloud(post.cloudId, { resource_type: "raw" });
  }

  // eliminar registro de la DB
  await postQueries.deletePost(postId);

  res.json({
    success: true,
    message: `Post: ${post.title} successfully deleted!`,
  });
}

async function updateLikePost(req, res, next) {
  let msg = "Liked!";

  const user = req.user;
  const postId = parseInt(req.params.postId);

  const [liked, post] = await Promise.all([
    postQueries.findExistingLike(postId, user.id),
    postQueries.getPostById(postId),
  ]);

  if (!post) {
    return next(new Errors.customError("Post not found", 404));
  }

  if (!liked) {
    await postQueries.like(postId, user.id);
  } else {
    await postQueries.dislike(postId, user.id);
    msg = "Disliked!";
  }

  res.json({
    success: true,
    message: msg,
  });
}

const postController = {
  getPosts,
  createPost,
  deletePost,
  updatePost,
  getSinglePost,
  updateLikePost,
  getPostBySlug,
};

export default postController;
