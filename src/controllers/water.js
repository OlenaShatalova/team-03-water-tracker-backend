import { WaterCollection } from '../db/models/Water.js';

export const getMonthWaterStats = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const userId = req.user._id;

    // діапазон дат
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // форматка дат
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // отримав дані
    const waterRecords = await WaterCollection.find({
      userId,
      date: {
        $gte: startDateStr,
        $lte: endDateStr,
      },
    }).lean();

    // тут масиви
    const daysInMonth = endDate.getDate();
    const monthStats = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dateStr = currentDate.toISOString().split('T')[0];

      // фільтр за сьогодні
      const dayRecords = waterRecords.filter(
        (record) => record.date === dateStr,
      );

      // загальник
      const totalWater = dayRecords.reduce(
        (sum, record) => sum + record.waterVolume,
        0,
      );

      // добова норма за записом абр за користувачем
      const dailyNorm = dayRecords[0]?.dailyNorm || req.user.dailyNorm;

      // порахувати відсоток
      const percentage = Math.round((totalWater / dailyNorm) * 100);

      monthStats.push({
        date: {
          day: currentDate.getDate(),
          month: currentDate.toLocaleString('en-US', { month: 'long' }),
        },
        dailyNorm: `${(dailyNorm / 1000).toFixed(1)} L`,
        percentage: `${percentage}%`,
        consumptionCount: dayRecords.length,
      });
    }

    res.json({
      status: 'success',
      data: monthStats,
    });
  } catch (error) {
    next(error);
  }
};
