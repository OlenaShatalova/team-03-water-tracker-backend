import Joi from 'joi';

export const getMonthWaterStatsSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).required(),
});
