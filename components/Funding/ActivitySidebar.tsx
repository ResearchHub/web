'use client';

import { FC } from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/utils/styles';
import { ActivityCard } from './ActivityCard';
import type { FeedEntry } from '@/types/feed';

interface ActivitySidebarProps {
  entries?: FeedEntry[];
  className?: string;
}

export const ActivitySidebar: FC<ActivitySidebarProps> = ({ entries, className }) => {
  const hasEntries = entries && entries.length > 0;

  return (
    <div data-activity-sidebar className={cn('p-6 h-full', className)}>
      <div className="flex items-center gap-2 mb-8">
        <Activity size={18} className="text-gray-800" />
        <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
      </div>

      {!hasEntries ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Activity size={24} className="text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">No recent activity</p>
          <p className="text-xs text-gray-400 mt-1">See recent contributions and updates</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {entries.map((entry) => (
            <ActivityCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
};
