import createHttpError from "http-errors";

export const ValidateBody = schema => {
    const Func = async (req, res, next) => {
 try {
    await schema.validateAsync(req.body, {
        abortEarly: false
      });
      next();
      }
      catch(error) {
        next(createHttpError(400, error.message));
      }
    };

    return Func;
};