import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { todayWaterController } from '../controllers/water.js';

const waterRouter = Router();

waterRouter.get('/water-today', ctrlWrapper(todayWaterController));

export default waterRouter;
