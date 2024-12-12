import jsonwebtoken from "jsonwebtoken";
import dotenv from 'dotenv';
import fs from 'node:fs';

dotenv.config();

export function createJWT(user){
    const id = user.id;

    const expiresIn = '1d';

    const payload = {
        sub: id,
        iat: Math.floor(Date.now() / 1000)
    };

    const signedToken = jsonwebtoken.sign(payload, process.env.SECRET_JWT, {expiresIn: expiresIn, algorithm: 'HS256'});

    return {
        token: 'Bearer ' + signedToken,
        expires: expiresIn
    }
}

export function saveMD(file){
    const newPath = `./uploads/${file.originalname}`;
    fs.renameSync(file.path, newPath);
    return newPath;
}

export async function calculateReadTime(filePath) {
    try {

      const content = fs.readFileSync(filePath, 'utf8');
  
      // Contar palabras usando una expresión regular
      const wordCount = content.split(/\s+/).filter(word => word).length;
  
      // Velocidad promedio de lectura en palabras por minuto
      const wordsPerMinute = 200;
      const readTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  
      return readTimeMinutes;

    } catch (err) {
      console.error('Error leyendo el archivo:', err);
      return null;
    }
  }