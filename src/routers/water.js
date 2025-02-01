import { Router } from 'express';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getMonthWaterStats } from '../controllers/water.js';
import { validateQuery } from '../utils/validateQuery.js';
import { getMonthWaterSchema } from '../validation/water.js';
import { authenticate } from '../middlewares/authenticate.js';

const waterRouter = Router();

waterRouter.get('/test', (req, res) => {
  res.json({ message: 'Water route is working' });
});

waterRouter.get(
  '/month',
  authenticate,
  validateQuery(getMonthWaterSchema),
  ctrlWrapper(getMonthWaterStats),
);

export default waterRouter;
