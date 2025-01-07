import express from "express";
import path from "node:path";
import passport from "passport";
import dotenv from "dotenv";
import configurePassport from "./config/passportConfig.js";
import errorHandler from "./controllers/errorHandler.js";

import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import categoryRoutes from "./routes/categoriesRoutes.js";

const app = express();

dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

configurePassport(passport);
app.use(passport.initialize());

app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/categories", categoryRoutes);

app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => console.log("Server running on port 3000"));
