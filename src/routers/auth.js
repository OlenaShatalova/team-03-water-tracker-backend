import { Router } from 'express';

const authRouter = Router();

authRouter.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working' });
});

export default authRouter;
