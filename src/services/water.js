import { UserCollection } from '../db/models/User.js';
import { WaterCollection } from '../db/models/Water.js';

export const addWaterVolume = async (payload, userId) => {
  const water = { ...payload, userId };
  return await WaterCollection.create(water);
};

export const updateWaterVolume = async (
  waterId,
  payload,
  userId,
  options = {},
) => {
  const result = await WaterCollection.findOneAndUpdate(
    { _id: waterId, userId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!result || !result.value) return null;

  return {
    water: result.value,
    isNew: Boolean(result?.lastErrorObject?.upserted),
  };
};

export const deleteWaterVolume = async (waterId) => {
  const water = await WaterCollection.findOneAndDelete({
    _id: waterId,
  });

  return water;
};

export const todayWater = async ({ userId }) => {
  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
  ).toISOString();
  const todayEnd = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
  ).toISOString();

  const todayRecord = await WaterCollection.find({
    userId,
    date: { $gte: todayStart, $lte: todayEnd },
  });

  const user = await UserCollection.findById(userId);
  const dailyNorm = user.dailyNorm; // Денна норма
  const totalTodayWater = todayRecord.reduce(
    (sum, r) => sum + r.waterVolume,
    0,
  );

  // Відсоток по дню без корекції на час
  let percentTodayWater = Math.round((totalTodayWater / dailyNorm) * 100);

  // Якщо відсоток перевищує 100%, то коригуємо до максимуму 100%
  percentTodayWater = Math.min(percentTodayWater, 100);

  return {
    todayRecord,
    percentTodayWater,
  };
};

export const getMonthStatistics = async (userId, month, year) => {
  // Визначення початку і кінця місяця, з урахуванням часового поясу
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)); // початок місяця
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); // останній день місяця

  // Перетворення дат у ISO формат для порівняння
  const startISO = startDate.toISOString();
  const endISO = endDate.toISOString();

  // Отримуємо всі записи за місяць
  const waterRecords = await WaterCollection.find({
    userId,
    date: { $gte: startISO, $lte: endISO }, // Фільтрація по датах в межах місяця
  })
    .populate('userId', 'dailyNorm')
    .lean();

  // Рахуємо кількість днів у місяці
  const daysInMonth = new Date(year, month, 0).getDate(); // кількість днів у місяці
  const dailyNorm = waterRecords[0]?.userId?.dailyNorm || 1500; // денна норма

  // Обчислюємо загальну норму води для місяця
  const totalNormForMonth = dailyNorm * daysInMonth; // загальна норма за місяць

  // Підраховуємо загальну кількість спожитої води за місяць
  const totalWaterMonth = waterRecords.reduce(
    (sum, record) => sum + record.waterVolume,
    0,
  );

  // Обчислюємо відсоток спожитої води відносно загальної норми за місяць
  const percentageMonth = Math.round(
    (totalWaterMonth / totalNormForMonth) * 100,
  );

  // Групуємо записи за днями
  const recordsByDay = waterRecords.reduce((acc, record) => {
    // Створюємо дату на основі записи і нормалізуємо її до початку доби
    const recordDate = new Date(record.date);
    const dayStart = new Date(
      Date.UTC(
        recordDate.getUTCFullYear(),
        recordDate.getUTCMonth(),
        recordDate.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    ); // Початок дня
    const dayEnd = new Date(
      Date.UTC(
        recordDate.getUTCFullYear(),
        recordDate.getUTCMonth(),
        recordDate.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    ); // Кінець дня

    // Якщо потрапляє в межі дня, додаємо до групи
    if (
      record.date >= dayStart.toISOString() &&
      record.date <= dayEnd.toISOString()
    ) {
      const dayKey = dayStart.toISOString();
      if (!acc[dayKey]) acc[dayKey] = [];
      acc[dayKey].push(record);
    }

    return acc;
  }, {});

  // Повертаємо статистику по дням і загальний відсоток
  return Array.from({ length: daysInMonth }, (_, index) => {
    const currentDay = index + 1;
    const currentDate = new Date(Date.UTC(year, month - 1, currentDay));
    const dayKey = currentDate.toISOString(); // ключ для дня

    const dayRecords = recordsByDay[dayKey] || [];
    const dailyWater = dayRecords.reduce(
      (sum, record) => sum + record.waterVolume,
      0,
    ); // спожита вода за день
    const dailyPercentage = Math.round((dailyWater / dailyNorm) * 100); // відсоток для дня

    return {
      date: {
        day: currentDay,
        month: currentDate.toLocaleString('en-US', { month: 'long' }),
      },
      dailyNorm: `${(dailyNorm / 1000).toFixed(1)} L`,
      percentage: `${dailyPercentage}%`,
      consumptionCount: dayRecords.length,
      dailyWaterConsumed: dayRecords.map((record) => record.waterVolume), // масив спожитої води за день
    };
  }).concat([
    {
      date: {
        day: 'Total',
        month: 'Month',
      },
      dailyNorm: `${(totalNormForMonth / 1000).toFixed(1)} L`,
      percentage: `${percentageMonth}%`,
      consumptionCount: waterRecords.length,
      dailyWaterConsumed: waterRecords.map((record) => record.waterVolume), // масив спожитої води за місяць
    },
  ]);
};
