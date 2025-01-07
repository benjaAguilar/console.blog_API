import { Router } from "express";
import tryCatch from "../lib/tryCatch.js";
import categoriesController from "../controllers/categoriesController.js";

const router = Router();

router.get("/", tryCatch(categoriesController.getAllCategories));

export default router;
