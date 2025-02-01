import { todayWater, getMonthStatistics } from '../services/water.js';

import createHttpError from 'http-errors';
import { updateUserService } from '../services/auth.js';

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

export const updateWaterRate = async (req, res, next) => {
  try {
    const { _id } = req.user; // Отримуємо ID користувача з req.user
    const { dailyNorm } = req.body; // Отримуємо dailyNorm з тіла запиту

    // Оновлюємо dailyNorm у базі даних
    const updatedUser = await updateUserService({ _id }, { dailyNorm });

    if (!updatedUser) {
      throw createHttpError(404, 'User not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        dailyNorm: updatedUser.dailyNorm,
      },
    });
  } catch (error) {
    next(error);
  }
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
