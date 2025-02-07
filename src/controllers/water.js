import {
  todayWater,
  getMonthStatistics,
  addWaterVolume,
  deleteWaterVolume,
  updateWaterVolume,
} from '../services/water.js';
import createHttpError from 'http-errors';
import { updateUserService } from '../services/auth.js';

export const addWaterController = async (req, res) => {
  const userId = req.user._id;
  const water = await addWaterVolume({ ...req.body }, userId);

  res.status(201).json({
    status: 201,
    message: 'Successfully created!',
    data: water,
  });
};

export const patchWaterVolumeController = async (req, res, next) => {
  const userId = req.user._id;
  const { waterId } = req.params;

  const result = await updateWaterVolume(waterId, { ...req.body }, userId);

  if (!result) {
    next(createHttpError(404, 'Water volume not found'));
    return;
  }

  const status = result.isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: 'Successfully updated water volume!',
    data: result.water,
  });
};

export const deleteWaterController = async (req, res, next) => {
  const userId = req.user._id;

  const { waterId } = req.params;

  const water = await deleteWaterVolume(waterId, userId);

  if (!water) {
    next(createHttpError(404, 'Water volume not found!'));
    return;
  }

  res.status(204).send();
};

export const todayWaterController = async (req, res) => {
  const userId = req.user._id;
  const data = await todayWater({ userId });

  res.status(200).json({
    status: 200,
    message: 'Successfully get user data!',
    data, //data.todayRecord - повертає список всіх записів споживання води користувачем за поточний день.
    //data.percentTodayWater - повертає кількість спожитої води від денної норми користувача у процентах.
  });
};

export const updateWaterRateController = async (req, res, next) => {
  try {
    const { _id } = req.user; // Отримуємо ID користувача з req.user
    const { dailyNorm } = req.body; // Отримуємо dailyNorm з тіла запиту

    // Оновлюємо dailyNorm у базі даних
    const updatedUser = await updateUserService({ _id }, { dailyNorm });

    if (!updatedUser) {
      throw createHttpError(404, 'User not found');
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully update water volume!',
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
      status: 200,
      data: monthStats,
    });
  } catch (error) {
    next(error);
  }
};
