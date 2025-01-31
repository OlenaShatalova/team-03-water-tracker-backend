export const CtrlWrapper = (ctrl) => {
  const Func = async (req, res, next) => {
    try {
      await ctrl(req, res, next);
    } catch (error) {
      next(error);
    }
  };

  return Func;
};
