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
import { isValidWaterId } from '../middlewares/IsValidWaterId.js';

const waterRouter = Router();

waterRouter.use(authenticate);

waterRouter.post(
  '/',
  validateBody(addWaterVolumeSchema),
  ctrlWrapper(addWaterController),
);

waterRouter.patch(
  '/:waterId',
  isValidWaterId,
  validateBody(updateWaterVolumeSchema),
  ctrlWrapper(patchWaterVolumeController),
);

waterRouter.delete('/:waterId', isValidId, ctrlWrapper(deleteWaterController));

waterRouter.get('/water-today', ctrlWrapper(todayWaterController));

waterRouter.patch(
  '/water-rate',
  validateBody(updateWaterRateSchema), // Валідація тіла запиту
  ctrlWrapper(updateWaterRateController), // Контролер
);

waterRouter.get(
  '/month',
  validateQuery(getMonthWaterSchema),
  ctrlWrapper(monthWaterController),
);

export default waterRouter;
