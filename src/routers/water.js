import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import { todayWaterController } from '../controllers/water.js';
import { monthWaterController } from '../controllers/water.js';

import { validateQuery } from '../utils/validateQuery.js';
import { getMonthWaterSchema } from '../validation/water.js';
import { authenticate } from '../middlewares/authenticate.js';

const waterRouter = Router();

waterRouter.get('/water-today', ctrlWrapper(todayWaterController));

waterRouter.get(
  '/month',
  authenticate,
  validateQuery(getMonthWaterSchema),
  ctrlWrapper(monthWaterController),
);

export default waterRouter;
