import express from 'express';
import path from 'node:path';
import passport from 'passport';
import configurePassport from './config/passportConfig.js';
import dotenv from 'dotenv';

import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

const app = express();

dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

configurePassport(passport)
app.use(passport.initialize());

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log('Server running on port 3000'));
