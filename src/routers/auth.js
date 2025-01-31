import { Router } from 'express';

import * as AuthController from "../controllers/auth.js";

import { CtrlWrapper } from "../utils/ctrlWrapper.js";

import { ValidateBody } from "../middlewares/validateBody.js";

import { AuthRegisterSchema, AuthLoginSchema } from "../validation/auth.js";

const AuthRouter = Router();

AuthRouter.post("/register", ValidateBody(AuthRegisterSchema), CtrlWrapper(AuthController.RegisterController));

AuthRouter.post("/login", ValidateBody(AuthLoginSchema), CtrlWrapper(AuthController.LoginController));

export default AuthRouter;
