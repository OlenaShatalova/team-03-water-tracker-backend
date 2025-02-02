import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import {
  todayWaterController,
  updateWaterRateController,
  monthWaterController,
  addWaterController,
  patchWaterVolumeController,
  deleteWaterController,
} from '../controllers/water.js';

import { validateBody } from '../middlewares/validateBody.js';
import { validateQuery } from '../utils/validateQuery.js';
import {
  getMonthWaterSchema,
  updateWaterRateSchema,
  addWaterVolumeSchema,
  updateWaterVolumeSchema,
} from '../validation/water.js';
import { authenticate } from '../middlewares/authenticate.js';
import { isValidId } from '../middlewares/isValidId.js';

const waterRouter = Router();
waterRouter.use(authenticate);

waterRouter.get('/test', (req, res) => {
  res.json({ message: 'Water route is working' });
});

waterRouter.post(
  '/',
  validateBody(addWaterVolumeSchema),
  ctrlWrapper(addWaterController),
);

waterRouter.patch(
  '/:waterId',
  isValidId,
  validateBody(updateWaterVolumeSchema),
  ctrlWrapper(patchWaterVolumeController),
);

waterRouter.delete('/:waterId', isValidId, ctrlWrapper(deleteWaterController));

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
