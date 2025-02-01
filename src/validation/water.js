import Joi from 'joi';

export const updateWaterRateSchema = Joi.object({
  dailyNorm: Joi.number().min(0).max(15000).required(),
});
