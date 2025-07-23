interface Update {
  id: number;
  createdDate: string;
  content?: any;
}

interface FundraisingMetadata {
  startDate?: string;
  endDate?: string;
}

interface WorkData {
  createdDate: string;
}

/**
 * Determine the start date for when updates can begin posting
 * @param fundraising - Fundraising metadata object
 * @param work - Work object with creation date
 * @returns ISO date string for when updates can start
 */
export const getUpdatesStartDate = (
  fundraising?: FundraisingMetadata | null,
  work?: WorkData
): string => {
  // Always use fundraise start date if available
  if (fundraising?.startDate) {
    return fundraising.startDate;
  }
  // Fallback to endDate minus 1 month if we have endDate
  if (fundraising?.endDate) {
    const endDate = new Date(fundraising.endDate);
    endDate.setMonth(endDate.getMonth() - 1);
    return endDate.toISOString();
  }
  // Final fallback to work creation date
  return work?.createdDate || new Date().toISOString();
};

/**
 * Calculate the update rate as a percentage of months with updates since a start date
 * Only the first update in each month counts towards the rate
 * @param updates - Array of updates with createdDate
 * @param startDate - Start date to calculate from (should always be provided)
 * @returns Percentage (0-100) representing how many months had updates
 */
export const calculateUpdateRate = (updates: Update[], startDate?: string): number => {
  if (updates.length === 0) {
    return 0;
  }

  const now = new Date();
  let start: Date;

  if (startDate) {
    start = new Date(startDate);
  } else if (updates.length > 0) {
    // Fallback - should rarely be used since components should provide startDate
    // Use earliest update date or recent date as last resort
    const earliestUpdate = updates.reduce((earliest, update) => {
      const updateDate = new Date(update.createdDate);
      return updateDate < earliest ? updateDate : earliest;
    }, new Date(updates[0].createdDate));
    start = new Date(earliestUpdate.getFullYear(), earliestUpdate.getMonth(), 1);
  } else {
    start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  }

  // Filter updates that are after the start date
  const relevantUpdates = updates.filter((update) => {
    const updateDate = new Date(update.createdDate);
    return updateDate >= start && updateDate <= now;
  });

  // Calculate the number of months in the period
  const monthsDiff =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;

  // Use actual months for calculation (no cap)
  const monthsToConsider = Math.max(1, monthsDiff); // At least 1 month

  // Group updates by month-year and only count unique months
  const uniqueMonths = new Set<string>();

  relevantUpdates.forEach((update) => {
    const updateDate = new Date(update.createdDate);
    const monthYear = `${updateDate.getFullYear()}-${updateDate.getMonth()}`;
    uniqueMonths.add(monthYear);
  });

  // Calculate percentage based on unique months with updates out of total months
  return Math.round((uniqueMonths.size / monthsToConsider) * 100);
};
