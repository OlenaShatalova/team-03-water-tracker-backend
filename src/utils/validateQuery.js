import createHttpError from 'http-errors';

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false });
    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      next(createHttpError(400, errorMessage));
    } else {
      next();
    }
  };
};
