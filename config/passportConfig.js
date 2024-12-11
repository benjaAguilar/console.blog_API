import { Strategy as jwtStrategy} from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import prisma from "../db/prismaClient.js";

import dotenv from 'dotenv';

dotenv.config();

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_JWT,
    algorithms: ["HS256"],
    jsonWebTokenOptions: {
      maxAge: '30s'
    }
}

const configurePassport = (passport) => {
    passport.use(
      new jwtStrategy(jwtOptions, (payload, done) => {
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp < currentTime) {
          return done(null, false, { message: "Token expired" });
        }

        prisma.user
          .findUnique({
            where: {
              id: payload.sub,
            },
          })
          .then((user) => {
            if (user) return done(null, user);
            return done(null, false);
          })
          .catch((err) => done(err, false));
      })
    );
  };
  
  export default configurePassport;