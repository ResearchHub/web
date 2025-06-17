interface Update {
  id: number;
  createdDate: string;
  content?: any;
}

/**
 * Calculate the update rate as a percentage of months with updates in the last 12 months
 * Only the first update in each month counts towards the rate
 * @param updates - Array of updates with createdDate
 * @returns Percentage (0-100) representing how many months had updates
 */
export const calculateUpdateRate = (updates: Update[]): number => {
  if (updates.length === 0) {
    return 0;
  }

  const now = new Date();
  const updatesInLast12Months = updates.filter((update) => {
    const updateDate = new Date(update.createdDate);
    const monthsDiff =
      (now.getFullYear() - updateDate.getFullYear()) * 12 +
      (now.getMonth() - updateDate.getMonth());
    return monthsDiff <= 12;
  });

  // Group updates by month-year and only count unique months
  const uniqueMonths = new Set<string>();

  updatesInLast12Months.forEach((update) => {
    const updateDate = new Date(update.createdDate);
    const monthYear = `${updateDate.getFullYear()}-${updateDate.getMonth()}`;
    uniqueMonths.add(monthYear);
  });

  // Calculate percentage based on unique months with updates out of 12 months
  return Math.round((uniqueMonths.size / 12) * 100);
};
