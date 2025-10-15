'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getTimelineStartDate } from '@/components/Fund/lib/FundUtils';

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
  const router = useRouter();
  const pathname = usePathname();

  const navigateToUpdatesTab = () => {
    if (!pathname) return;
    const basePath = pathname.replace(
      /\/(updates|conversation|applications|reviews|bounties|history)$/i,
      ''
    );
    const target = `${basePath}/updates`;
    router.push(target);
  };
  // Generate timeline from startDate to current date
  const generateTimeline = () => {
    const timeline = [];
    const now = new Date();

    const start = getTimelineStartDate(startDate, updates);
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
      <div className="flex flex-col gap-1 mb-3">
        {timeline.map((month) => {
          const monthText = `${month.monthName} ${String(month.year).slice(-2)}`;

          return (
            <div key={month.monthYear} className="whitespace-nowrap">
              {month.hasUpdate ? (
                <button
                  type="button"
                  onClick={navigateToUpdatesTab}
                  className="text-sm font-medium underline text-gray-700 hover:text-gray-900"
                  aria-label={`View updates for ${month.monthName} ${month.year}`}
                  title={`${month.monthName} ${month.year} - ${month.updateCount} update${month.updateCount > 1 ? 's' : ''}`}
                >
                  {monthText}
                </button>
              ) : (
                <span
                  className="text-sm font-medium text-gray-500"
                  title={`${month.monthName} ${month.year} - No updates`}
                >
                  {monthText}
                </span>
              )}
              {month.updateCount > 1 && (
                <span className="text-xs ml-2 text-gray-500">x {month.updateCount}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
