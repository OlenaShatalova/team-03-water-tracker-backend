import Joi from 'joi';

export const updateWaterRateSchema = Joi.object({
  dailyNorm: Joi.number().min(0).max(15000).required(),
});

export const getMonthWaterSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).required(),
});
