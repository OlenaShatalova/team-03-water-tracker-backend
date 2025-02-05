import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { logger } from './middlewares/logger.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';
import { env } from './utils/env.js';

import authRouter from './routers/auth.js';
import waterRouter from './routers/water.js';
import userRouter from './routers/user.js';

export const startServer = () => {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.static('uploads'));
  app.use(logger);

  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/water', waterRouter);
  app.use('/api-docs', swaggerDocs());

  app.use(notFoundHandler);

  app.use(errorHandler);

  const port = Number(env('PORT', 3000));

  app.listen(port, () => console.log(`Server running on ${port} port`));
};
