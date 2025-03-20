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
          req.message.fail.invalidFields,
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
          errorMessage: req.message.fail.passwordHashError,
          hashError: err,
        });
        return;
      }
      //crear ususario en la db
      await userQueries.registerUser(username, hashedPassword);
      //responder con json
      res.json({
        success: true,
        message: req.message.success.createdUser,
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
          req.message.fail.invalidFields,
          400,
          validationErrors.array(),
        ),
      );
    }

    const { username, password } = req.body;
    const user = await userQueries.getUserByName(username);

    if (!user)
      return next(new Errors.customError(req.message.fail.userNotFound, 404));

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return next(
        new Errors.customError(req.message.fail.incorrectPassword, 400),
      );

    const tokenObject = createJWT(user);

    res.cookie("authToken", tokenObject.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: `${req.message.success.loginUser} ${username}`,
      user,
    });
  }),
];

async function getAuthUser(req, res, next) {
  const user = req.user;

  if (!user) {
    return next(new Errors.customError("Register a user", 401));
  }

  res.json({
    success: true,
    id: user.id,
    name: user.username,
    role: user.role,
  });
}

async function logoutUser(req, res, next) {
  const user = req.user;

  if (!user) {
    return next(new Errors.customError(req.message.fail.logout, 401));
  }

  res.clearCookie("authToken");

  res.json({
    success: true,
    message: req.message.success.logoutUser,
  });
}

const userController = {
  registerUser,
  loginUser,
  getAuthUser,
  logoutUser,
};

export default userController;
