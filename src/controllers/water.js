// import * as waterService from '../services/water.js';
import { todayWater, getMonthStatistics } from '../services/water.js';

export const todayWaterController = async (req, res) => {
  const userId = req.user._id;
  const data = await todayWater({ userId });
  res.status(201).json({
    status: 201,
    message: 'Successfully get user data!',
    data, //data.todayRecord - повертає список всіх записів споживання води користувачем за поточний день.
    //data.percentTodayWater - повертає кількість спожитої води від денної норми користувача у процентах.
  });
};

export const monthWaterController = async (req, res, next) => {
  try {
    const { month, year } = req.query;

    const userId = req.user._id;

    const monthStats = await getMonthStatistics(
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
