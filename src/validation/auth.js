import Joi from 'joi';

import { EMAIL_REGEXP, GENDERS } from '../constants/user.js';

export const authRegisterSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().pattern(EMAIL_REGEXP).required(),
  password: Joi.string().min(8).max(64).required(),
});

export const authLoginSchema = Joi.object({
  email: Joi.string().pattern(EMAIL_REGEXP).required(),
  password: Joi.string().min(8).max(64).required(),
});

export const updateUserDataSchema = Joi.object({
  name: Joi.string().min(2).max(30),
  email: Joi.string().pattern(EMAIL_REGEXP),
  password: Joi.string().min(6).max(64),
  gender: Joi.string().valid(...Object.values(GENDERS)),
  dailyNorm: Joi.string(),
  oldPassword: Joi.string().min(6).max(64),
  newPassword: Joi.string().min(6).max(64),
});

export const sendResetEmailSchema = Joi.object({
  email: Joi.string().pattern(EMAIL_REGEXP).required().messages({
    'string.pattern.base': 'Email is invalid',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8).max(64).required(),
  token: Joi.string().required(),
});
