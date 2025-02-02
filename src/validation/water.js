import Joi from 'joi';

export const addWaterVolumeSchema = Joi.object({
  waterVolume: Joi.number().integer().required().min(1).max(5000).messages({
    'number.base': 'Amount should be a number',
    'number.min': 'Amount should be at least 1 ml',
    'number.max': 'Amount should be at most 5000 ml',
    'any.required': 'Amount is required',
  }),
  date: Joi.date().iso().required().messages({
    'date.base': 'Date should be correct',
    'date.format':
      'Date should be at ISO 8601 format (example, 2025-01-30T14:00:00Z)',
    'any.required': 'Amount is required',
  }),
});

export const updateWaterVolumeSchema = Joi.object({
  waterVolume: Joi.number().integer().required().min(1).max(5000).messages({
    'number.base': 'Amount should be a number',
    'number.min': 'Amount should be at least 1 ml',
    'number.max': 'Amount should be at most 5000 ml',
    'any.required': 'Amount is required',
  }),
  date: Joi.date().iso().required().messages({
    'date.base': 'Date should be correct',
    'date.format':
      'Date should be at ISO 8601 format (example, 2025-01-30T14:00:00Z)',
    'any.required': 'Amount is required',
  }),
});
// .min(1)
// .messages({
//   'object.min': 'At least one field is required for update',
// });

export const updateWaterRateSchema = Joi.object({
  dailyNorm: Joi.number().min(0).max(15000).required(),
});

export const getMonthWaterSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).required(),
});
