const BASE_DATE = new Date("2026-05-21");

const getDate = (date) => {
  const originalDate = new Date(date);

  const diffDays = Math.floor(
    (Date.now() - BASE_DATE.getTime()) / (1000 * 60 * 60 * 24)
  ) - 1;

  originalDate.setDate(originalDate.getDate() + diffDays);

  // 0 = Domingo | 1 = Segunda
  if (originalDate.getDay() === 1) {
    originalDate.setDate(originalDate.getDate() + 1);
  }

  if (originalDate.getDay() === 0) {
    originalDate.setDate(originalDate.getDate() + 2);
  }

  return originalDate.toISOString();
};

export default getDate