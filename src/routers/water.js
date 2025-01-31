import { Router } from 'express';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getMonthWaterStats } from '../controllers/water.js';
import { validateBody } from '../middlewares/validateBody.js';
import { getMonthWaterStatsSchema } from '../validation/water.js';

const waterRouter = Router();

waterRouter.get('/test', (req, res) => {
  res.json({ message: 'Water route is working' });
});

waterRouter.get(
  '/month',
  validateBody(getMonthWaterStatsSchema),
  ctrlWrapper(getMonthWaterStats),
);

export default waterRouter;
