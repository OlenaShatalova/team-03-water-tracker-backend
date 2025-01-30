import { Router } from 'express';

const waterRouter = Router();

waterRouter.get('/test', (req, res) => {
  res.json({ message: 'Water route is working' });
});

export default waterRouter;
