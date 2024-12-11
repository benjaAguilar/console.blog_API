import { validationResult } from 'express-validator';
import validator from '../config/validator.js';
import bcrypt from 'bcryptjs';
import userQueries from '../db/userQueries.js';
import { createJWT } from '../lib/utils.js';

const registerUser = [
    validator.validateRegister,
    async (req, res, next) => {
        const validationErrors = validationResult(req);
        if(!validationErrors.isEmpty()){
            res.status(400).json({
                status: 400,
                errorMessages: validationErrors.array()
            });
            return;
        }

        const { username, password } = req.body;
        //hashear contrasena
        bcrypt.hash(password, 10, async (err, hashedPassword) => {
            if(err){
                res.status(500).json({
                    status: 500,
                    errorMessage: 'Internal Server error creating user',
                    hashError: err
                });
                return;
            }
            //crear ususario en la db
            await userQueries.registerUser(username, hashedPassword);
            //responder con json
            res.json({
                message: 'User Created successfully'
            })
        })
    }    
]

// CREAR LOGIN DE USUARIO y generar TOKEN
const loginUser = [
    validator.validateLogin,
    async (req, res, next) => {
        const validationErrors = validationResult(req);
        if(!validationErrors.isEmpty()){
            res.status(400).json({
                status: 400,
                errorMessages: validationErrors.array()
            });
            return;
        }

        const { username, password } = req.body;
        const user = await userQueries.getUserByName(username);

        if(!user) return res.status(404).json({status: 404, message: 'User not Found'});

        const match = await bcrypt.compare(password, user.password);

        if(!match) return res.status(400).json({status: 400, message: 'Incorrect password'});

        const tokenObject = createJWT(user);

        res.json({
            success: true,
            token: tokenObject.token,
            expires: tokenObject.expires
        })
    }
]

const userController = {
    registerUser,
    loginUser
}

export default userController;