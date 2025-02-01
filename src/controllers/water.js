import { todayWater } from '../services/water.js';

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
