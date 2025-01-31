import { Router } from "express";

import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { GetCurrentUser } from "../controllers/userController.js";

export const userRouter = Router();

userRouter.get("/current", ctrlWrapper(GetCurrentUser) );
