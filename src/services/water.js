import { UserCollection } from '../db/models/User.js';
import { WaterCollection } from '../db/models/Water.js';

import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60 * 60 });

export const todayWater = async ({ userId }) => {
  const today = new Date().toISOString().split('T')[0];

  const cacheKey = `todayWater-${userId}-${today}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const todayRecord = await WaterCollection.find({ userId, date: today });
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
  // діапазон дат
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
    const currentDate = new Date(year, month - 1, index + 1);
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
