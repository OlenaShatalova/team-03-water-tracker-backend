import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { todayWaterController, updateWaterRate } from '../controllers/water.js';

import { validateBody } from '../middlewares/validateBody.js';
import { updateWaterRateSchema } from '../validation/water.js';
import { authenticate } from '../middlewares/authenticate.js';

const waterRouter = Router();

waterRouter.get('/water-today', ctrlWrapper(todayWaterController));

waterRouter.patch(
  '/water-rate',
  authenticate, // Перевірка авторизації
  validateBody(updateWaterRateSchema), // Валідація тіла запиту
  ctrlWrapper(updateWaterRate), // Контролер
);

export default waterRouter;
