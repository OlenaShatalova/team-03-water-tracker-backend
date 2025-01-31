import Joi from "joi";

import { EMAIL_REGEXP, GENDERS } from "../constants/user.js";

export const authRegisterSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().pattern(EMAIL_REGEXP).required(),
    password: Joi.string().min(6).max(64).required(),
});

export const authLoginSchema = Joi.object({
    email: Joi.string().pattern(EMAIL_REGEXP).required(),
    password: Joi.string().min(6).max(64).required(),
});


export const updateUserDataSchema = Joi.object({
  name: Joi.string().min(2).max(30),
    email: Joi.string().pattern(EMAIL_REGEXP),
    password: Joi.string().min(6).max(64),
    gender: Joi.string().valid(...Object.values(GENDERS)),
    dailyNorm: Joi.string(),
});

