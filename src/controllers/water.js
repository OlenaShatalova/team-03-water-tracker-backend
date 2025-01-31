import * as waterService from '../services/water.js';

export const getMonthWaterStats = async (req, res, next) => {
  try {
    console.log('Query params:', req.query); // Додайте це логування

    const { month, year } = req.query;

    // Перевірка чи параметри існують
    if (!month || !year) {
      return res.status(400).json({
        status: 'error',
        message: 'Month and year are required',
      });
    }
    const userId = req.user._id;
    console.log('User ID:', userId); // Додайте це логування

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
    console.error('Error:', error); // Додайте це логування

    next(error);
  }
};
