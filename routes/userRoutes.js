import { Router } from "express";
import userController from "../controllers/userController.js";
import passport from "passport";
import tryCatch from "../lib/tryCatch.js";

const router = Router();

router.post("/register", userController.registerUser);

router.post("/login", userController.loginUser);

router.get(
  "/authUser",
  passport.authenticate("jwt", { session: false }),
  tryCatch(userController.getAuthUser),
);

router.post(
  "/logout",
  passport.authenticate("jwt", { session: false }),
  tryCatch(userController.logoutUser),
);

export default router;
