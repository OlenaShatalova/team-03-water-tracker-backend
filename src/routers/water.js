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

waterRouter.post(
  '/',
  validateBody(addWaterVolumeSchema),
  ctrlWrapper(addWaterController),
);

waterRouter.patch(
  '/water-rate',
  validateBody(updateWaterRateSchema),
  ctrlWrapper(updateWaterRateController),
);

waterRouter.patch(
  '/:waterId',
  isValidId,
  validateBody(updateWaterVolumeSchema),
  ctrlWrapper(patchWaterVolumeController),
);

waterRouter.delete('/:waterId', isValidId, ctrlWrapper(deleteWaterController));

waterRouter.get('/today', ctrlWrapper(todayWaterController));

waterRouter.get(
  '/month',
  validateQuery(getMonthWaterSchema), //тут повернув validateQuery замість validateBody
  ctrlWrapper(monthWaterController),
);

export default waterRouter;
