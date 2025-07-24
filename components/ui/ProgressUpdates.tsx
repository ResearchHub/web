import React from 'react';

interface Update {
  id: number;
  createdDate: string;
  content?: any;
}

interface ProgressUpdatesProps {
  updates: Update[];
  startDate?: string; // When updates can start being posted (e.g., fundraise start date)
  className?: string;
}

export const ProgressUpdates: React.FC<ProgressUpdatesProps> = ({
  updates = [],
  startDate,
  className = '',
}) => {
  // Generate timeline from startDate to current date
  const generateTimeline = () => {
    const timeline = [];
    const now = new Date();

    // If no startDate provided, use the earliest update date or current date minus 3 months
    let start: Date;
    if (startDate) {
      const startDateObj = new Date(startDate);
      // Normalize to the beginning of the start month to ensure we include the full month
      start = new Date(startDateObj.getFullYear(), startDateObj.getMonth(), 1);
    } else if (updates.length > 0) {
      // Find the earliest update
      const earliestUpdate = updates.reduce((earliest, update) => {
        const updateDate = new Date(update.createdDate);
        return updateDate < earliest ? updateDate : earliest;
      }, new Date(updates[0].createdDate));
      start = new Date(earliestUpdate.getFullYear(), earliestUpdate.getMonth(), 1);
    } else {
      // Default to 3 months ago
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    }

    const current = new Date(start);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Generate months from start to current month (inclusive)
    while (current <= currentMonthStart) {
      const monthYear = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const monthName = current.toLocaleDateString('en-US', { month: 'short' });
      const year = current.getFullYear();

      const monthUpdates = updates.filter((update) => {
        const updateDate = new Date(update.createdDate);
        return (
          updateDate.getMonth() === current.getMonth() &&
          updateDate.getFullYear() === current.getFullYear()
        );
      });

      timeline.push({
        monthYear,
        monthName,
        year,
        hasUpdate: monthUpdates.length > 0,
        updateCount: monthUpdates.length,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return timeline;
  };

  const timeline = generateTimeline();

  // Don't render if timeline is empty
  if (timeline.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {/* Monthly Timeline */}
      <div className="flex flex-wrap gap-1 mb-3">
        {timeline.map((month) => {
          const monthText = `${month.monthName} ${String(month.year).slice(-2)}`;

          return (
            <div
              key={month.monthYear}
              className={`
                relative px-2 py-1.5 rounded-md border text-center transition-all flex-shrink-0
                ${
                  month.hasUpdate
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                }
              `}
              title={
                month.hasUpdate
                  ? `${month.monthName} ${month.year} - ${month.updateCount} update${month.updateCount > 1 ? 's' : ''}`
                  : `${month.monthName} ${month.year} - No updates`
              }
            >
              <div className="whitespace-nowrap">
                <span className="text-sm font-medium">{monthText}</span>
                {month.updateCount > 1 && (
                  <span className="text-xs ml-1 text-green-500">x{month.updateCount}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
          <span>Has updates</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white border border-gray-200 rounded"></div>
          <span>No updates</span>
        </div>
      </div>
    </div>
  );
};
