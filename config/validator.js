import { body } from "express-validator";
import prisma from "../db/prismaClient.js";

const validateRegister = [
    body('username').trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 4, max: 20 }).withMessage('Username has to be at least 4 characters and a maximum of 20 characters')
    .isAlphanumeric().withMessage('Username can only contain aplhanumeric caracters')
    .custom(async (value) => {
        const user = await prisma.user.findFirst({
            where: {
                username: value
            }
        });

        if (user) {
          return Promise.reject('User already exists');
        }
      }),
    body('password').trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 20 }).withMessage('Password has to be at least 8 characters and a maximum of 20 characters'),
    body('r-password')
    .trim()
    .notEmpty().withMessage('Repeat password is required')
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
]

const validateLogin = [
    body('username').trim()
    .notEmpty().withMessage('Username is required')
    .isAlphanumeric().withMessage('Username can only contain aplhanumeric caracters'),
    body('password').trim()
    .notEmpty().withMessage('Password is required')
]

const validateComment = [
    body('content').trim()
    .notEmpty().withMessage('Comment cannot be empty')
]

const validator = {
    validateRegister,
    validateLogin,
    validateComment
}

export default validator;