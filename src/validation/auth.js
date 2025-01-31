import Joi from "joi";

import { EMAIL_REGEXP } from "../constants/user.js";

export const authRegisterSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().pattern(EMAIL_REGEXP).required(),
    password: Joi.string().min(6).max(64).required(),
});

export const authLoginSchema = Joi.object({
    email: Joi.string().pattern(EMAIL_REGEXP).required(),
    password: Joi.string().min(6).max(64).required(),
});
