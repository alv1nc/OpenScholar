import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/authRoutes';
import papersRoutes from './routes/papersRoutes';
import conversationsRoutes from './routes/conversationsRoutes';
import usersRoutes from './routes/usersRoutes';

const app: Express = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Base Health Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Mounted Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/papers', papersRoutes);
app.use('/api/v1/conversations', conversationsRoutes);
app.use('/api/v1/users', usersRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
