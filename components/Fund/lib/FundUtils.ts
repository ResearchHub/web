interface Update {
  id: number;
  createdDate: string;
  content?: any;
}

/**
 * Calculate the update rate as a percentage of months with updates in the last 12 months
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

  return Math.round((updatesInLast12Months.length / 12) * 100);
};
