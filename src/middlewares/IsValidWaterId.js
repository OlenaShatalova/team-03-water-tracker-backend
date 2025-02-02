import { isValidObjectId } from 'mongoose';
import createError from 'http-errors';

export const isValidWaterId = (req, res, next) => {
  const { waterId } = req.params;
  if (!isValidObjectId(waterId)) {
    return next(createError(400, `${waterId} not valid id`));
  }
  next();
};
