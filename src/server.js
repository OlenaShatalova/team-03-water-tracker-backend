import express from 'express';
import cors from 'cors';

import { logger } from './middlewares/logger.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

import AuthRouter from './routers/auth.js';
import waterRouter from './routers/water.js';

import { env } from './utils/env.js';

export const startServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static('uploads'));
  app.use(logger);

  app.use('/api/auth', AuthRouter);
  app.use('/api/water', waterRouter);
  app.use('/api-docs', swaggerDocs());

  app.use(notFoundHandler);

  app.use(errorHandler);

  const port = Number(env('PORT', 3000));

  app.listen(port, () => console.log(`Server running on ${port} port`));
};
