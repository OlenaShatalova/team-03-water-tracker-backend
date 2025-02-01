import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import {
  todayWaterController,
  updateWaterRateController,
  monthWaterController,
} from '../controllers/water.js';

import { validateBody } from '../middlewares/validateBody.js';
import { validateQuery } from '../utils/validateQuery.js';
import {
  getMonthWaterSchema,
  updateWaterRateSchema,
} from '../validation/water.js';
import { authenticate } from '../middlewares/authenticate.js';

const waterRouter = Router();

waterRouter.get('/water-today', ctrlWrapper(todayWaterController));

waterRouter.patch(
  '/water-rate',
  authenticate, // Перевірка авторизації
  validateBody(updateWaterRateSchema), // Валідація тіла запиту
  ctrlWrapper(updateWaterRateController), // Контролер
);

waterRouter.get(
  '/month',
  authenticate,
  validateQuery(getMonthWaterSchema),
  ctrlWrapper(monthWaterController),
);

export default waterRouter;
