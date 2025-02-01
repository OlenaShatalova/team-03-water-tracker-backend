import Joi from 'joi';

export const updateDailyNormSchema = Joi.object({
  dailyNorm: Joi.number().min(0).max(15000).required(),
});
