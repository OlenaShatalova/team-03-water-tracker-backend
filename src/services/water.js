import { UserCollection } from '../db/models/User';
import { WaterCollection } from '../db/models/Water';

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
