import Joi from "joi";

import { EmailRegexp } from "../constants/user.js";

export const AuthRegisterSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().pattern(EmailRegexp).required(),
    password: Joi.string().min(6).max(64).required(),
});

export const AuthLoginSchema = Joi.object({
    email: Joi.string().pattern(EmailRegexp).required(),
    password: Joi.string().min(6).max(64).required(),
});