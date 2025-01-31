import * as waterService from '../services/water.js';

export const getMonthWaterStats = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const userId = req.user._id;

    const monthStats = await waterService.getMonthStatistics(
      userId,
      Number(month),
      Number(year),
    );

    res.json({
      status: 'success',
      data: monthStats,
    });
  } catch (error) {
    next(error);
  }
};
