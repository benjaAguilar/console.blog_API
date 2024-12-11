import jsonwebtoken from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

export function createJWT(user){
    const id = user.id;

    const expiresIn = '30s';

    const payload = {
        sub: id,
        iat: Date.now()
    };

    const signedToken = jsonwebtoken.sign(payload, process.env.SECRET_JWT, {expiresIn: expiresIn, algorithm: 'HS256'});

    return {
        token: 'Bearer ' + signedToken,
        expires: expiresIn
    }
}