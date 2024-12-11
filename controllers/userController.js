import { validationResult } from 'express-validator';
import validator from '../config/validator.js';
import bcrypt from 'bcryptjs';
import userQueries from '../db/userQueries.js';

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

const userController = {
    registerUser
}

export default userController;