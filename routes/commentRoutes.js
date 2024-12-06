import { Router } from "express";
import commentController from '../controllers/commentController.js';

const router = Router();

router.get('/', commentController.getComments);

export default router;