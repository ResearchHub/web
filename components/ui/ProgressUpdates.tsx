import React from 'react';

interface Update {
  id: number;
  createdDate: string;
  content?: any;
}

interface ProgressUpdatesProps {
  updates: Update[];
  className?: string;
}

export const ProgressUpdates: React.FC<ProgressUpdatesProps> = ({
  updates = [],
  className = '',
}) => {
  // Generate exactly 12 months starting from current date
  const generateTimeline = () => {
    const timeline = [];
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start from current month
    const current = new Date(startDate);
    let monthCount = 0;

    while (monthCount < 12) {
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
      monthCount++;
    }

    return timeline;
  };

  const timeline = generateTimeline();

  return (
    <div className={className}>
      {/* Monthly Timeline */}
      <div className="flex flex-wrap gap-1 mb-3">
        {timeline.map((month) => {
          const now = new Date();
          const monthDate = new Date(month.year, new Date(`${month.monthName} 1, 2000`).getMonth());
          const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const isInPast = monthDate < currentMonthStart;
          const isPastWithoutUpdates = isInPast && !month.hasUpdate;

          return (
            <div
              key={month.monthYear}
              className={`
                relative p-1.5 rounded-md border text-center transition-all flex-shrink-0 w-11
                ${
                  month.hasUpdate
                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }
              `}
              title={
                month.hasUpdate
                  ? `${month.monthName} ${month.year} - ${month.updateCount} update${month.updateCount > 1 ? 's' : ''}`
                  : `${month.monthName} ${month.year} - No updates`
              }
            >
              {/* Diagonal lines for past months without updates */}
              {isPastWithoutUpdates && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      -45deg,
                      transparent 0px,
                      transparent 3px,
                      #d1d5db 3px,
                      #d1d5db 6px,
                      transparent 6px,
                      transparent 9px
                    )`,
                  }}
                />
              )}

              <div className="text-xs font-medium">{month.monthName}</div>
              <div className="text-xs text-gray-500 leading-none">
                {month.year.toString().slice(-2)}
              </div>

              {/* Update Count Badge - Top Right Corner */}
              {month.hasUpdate && (
                <div className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full min-w-[14px] h-3.5 flex items-center justify-center leading-none px-1 z-10">
                  {month.updateCount}
                </div>
              )}
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
          <div
            className="relative w-3 h-3 bg-white border border-gray-200 rounded"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent 0px,
                transparent 3px,
                #d1d5db 3px,
                #d1d5db 6px,
                transparent 6px,
                transparent 9px
              )`,
              backgroundBlendMode: 'multiply',
              opacity: 0.6,
            }}
          ></div>
          <span>No updates</span>
        </div>
      </div>
    </div>
  );
};
