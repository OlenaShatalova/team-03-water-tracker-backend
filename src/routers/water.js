import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper';
import { todayWaterController } from '../controllers/water';

const waterRouter = Router();

waterRouter.get('/water-today', ctrlWrapper(todayWaterController));

export default waterRouter;
