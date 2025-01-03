import { validationResult } from "express-validator";
import validator from "../config/validator.js";
import bcrypt from "bcryptjs";
import userQueries from "../db/userQueries.js";
import { createJWT } from "../lib/utils.js";
import tryCatch from "../lib/tryCatch.js";
import Errors from "../lib/customError.js";

const registerUser = [
  validator.validateRegister,
  tryCatch(async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return next(
        new Errors.validationError(
          "Invalid fields",
          400,
          validationErrors.array(),
        ),
      );
    }

    const { username, password } = req.body;
    //hashear contrasena
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) {
        res.status(500).json({
          status: 500,
          errorMessage: "Internal Server error creating user",
          hashError: err,
        });
        return;
      }
      //crear ususario en la db
      await userQueries.registerUser(username, hashedPassword);
      //responder con json
      res.json({
        success: true,
        message: "User Created successfully",
      });
    });
  }),
];

// CREAR LOGIN DE USUARIO y generar TOKEN
const loginUser = [
  validator.validateLogin,
  tryCatch(async (req, res, next) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return next(
        new Errors.validationError(
          "Invalid fields",
          400,
          validationErrors.array(),
        ),
      );
    }

    const { username, password } = req.body;
    const user = await userQueries.getUserByName(username);

    if (!user) return next(new Errors.customError("User not Found", 404));

    const match = await bcrypt.compare(password, user.password);

    if (!match) return next(new Errors.customError("Incorrect Password", 400));

    const tokenObject = createJWT(user);

    res.json({
      success: true,
      token: tokenObject.token,
      expires: tokenObject.expires,
      message: `Successfully logged in as ${username}`,
    });
  }),
];

const userController = {
  registerUser,
  loginUser,
};

export default userController;
