import { UserCollection } from '../db/models/User.js';
import { WaterCollection } from '../db/models/Water.js';

import NodeCache from 'node-cache';

export const addWaterVolume = async (payload, userId) => {
  // const water = { ...payload, date, userId };
  // const today = new Date().toISOString().split('T')[0];
  const date = new Date(payload.date).toISOString().split('T')[0];

  const water = {
    ...payload,
    date, // використовуємо відформатовану дату
    userId,
  };

  const cacheKey = `todayWater-${userId}-${date}`;

  cache.del(cacheKey);

  return await WaterCollection.create(water);
};

export const updateWaterVolume = async (
  waterId,
  payload,
  userId,
  options = {},
) => {
  const today = new Date().toISOString().split('T')[0];
  const result = await WaterCollection.findOneAndUpdate(
    { _id: waterId, userId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );
  const cacheKey = `todayWater-${userId}-${today}`;
  cache.del(cacheKey);

  if (!result || !result.value) return null;

  return {
    water: result.value,
    isNew: Boolean(result?.lastErrorObject?.upserted),
  };
};

export const deleteWaterVolume = async (waterId) => {
  const today = new Date().toISOString().split('T')[0];

  const water = await WaterCollection.findOneAndDelete({
    _id: waterId,
  });

  if (water) {
    const cacheKey = `todayWater-${water.userId}-${today}`;
    cache.del(cacheKey);
  }

  return water;
};

const cache = new NodeCache({ stdTTL: 60 * 60 });

export const todayWater = async ({ userId }) => {
  const today = new Date().toISOString().split('T')[0];

  // const now = new Date();
  // const timezoneOffset = now.getTimezoneOffset();

  // const todayStart = new Date(now);
  // todayStart.setMinutes(todayStart.getMinutes() - timezoneOffset); // Корректировка по времени

  // todayStart.setHours(0, 0, 0, 0);

  // const todayEnd = new Date(now);
  // todayEnd.setMinutes(todayEnd.getMinutes() - timezoneOffset); // Корректировка по времени

  // todayEnd.setHours(23, 59, 59, 999);

  const cacheKey = `todayWater-${userId}-${today}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const todayRecord = await WaterCollection.find({
    userId,
    date: today,
    // { $gte: todayStart, $lte: todayEnd },
  });

  const user = await UserCollection.findById(userId);
  const getDailyNorm = user.dailyNorm;
  const totalTodayWater = todayRecord.reduce(
    (sum, r) => sum + r.waterVolume,
    0,
  );

  const percentTodayWater = Math.round((totalTodayWater / getDailyNorm) * 100);

  const result = { todayRecord, percentTodayWater };

  cache.set(cacheKey, result);

  return result;
};

export const getMonthStatistics = async (userId, month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  const waterRecords = await WaterCollection.find({
    userId,
    date: {
      $gte: startDateStr,
      $lte: endDateStr,
    },
  })
    .populate('userId', 'dailyNorm')
    .lean();

  const daysInMonth = endDate.getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const currentDate = new Date(Date.UTC(year, month - 1, index + 1));
    const dateStr = currentDate.toISOString().split('T')[0];

    const dayRecords = waterRecords.filter((record) => record.date === dateStr);

    const totalWater = dayRecords.reduce(
      (sum, record) => sum + record.waterVolume,
      0,
    );

    const dailyNorm =
      dayRecords[0]?.dailyNorm || waterRecords[0]?.userId.dailyNorm || 1500;

    return {
      date: {
        day: currentDate.getDate(),
        month: currentDate.toLocaleString('en-US', { month: 'long' }),
      },
      dailyNorm: `${(dailyNorm / 1000).toFixed(1)} L`,
      percentage: `${Math.round((totalWater / dailyNorm) * 100)}%`,
      consumptionCount: dayRecords.length,
    };
  });
};
