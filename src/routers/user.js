import { Router } from 'express';

import * as usersController from '../controllers/userController.js';

import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import { upload } from '../middlewares/upload.js';
import { updateUserDataSchema } from '../validation/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/', ctrlWrapper(usersController.getCurrentUser));

userRouter.patch(
  '/',
  validateBody(updateUserDataSchema),
  ctrlWrapper(usersController.updateCurrentUser),
);

userRouter.patch(
  '/avatar',
  upload.single('avatar'),
  ctrlWrapper(usersController.updateUserAvatar),
);

export default userRouter;
