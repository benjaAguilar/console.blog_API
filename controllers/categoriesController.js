import categoryQueries from "../db/categoryQueries.js";

async function getAllCategories(req, res) {
  const categories = await categoryQueries.getCategories();

  res.json({
    success: true,
    categories,
  });
}

const categoriesController = {
  getAllCategories,
};

export default categoriesController;
