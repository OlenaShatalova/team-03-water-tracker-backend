import { Router } from 'express';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getCurrentUser, updateCurrentUser } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import { updateUserDataSchema } from '../validation/auth.js';

export const userRouter = Router();

userRouter.get('/current', authenticate, ctrlWrapper(getCurrentUser));
userRouter.patch(
  '/current/update',
  authenticate,
  validateBody(updateUserDataSchema),
  ctrlWrapper(updateCurrentUser),
);
