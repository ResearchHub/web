'use client';

import { FC } from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/utils/styles';
import { ActivityCard } from './ActivityCard';
import type { FeedEntry } from '@/types/feed';

interface ActivityFeedOverviewProps {
  entries?: FeedEntry[];
  className?: string;
}

export const ActivityFeedOverview: FC<ActivityFeedOverviewProps> = ({ entries, className }) => {
  const hasEntries = entries && entries.length > 0;

  if (!hasEntries) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <Activity size={24} className="text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">No recent activity</p>
        <p className="text-xs text-gray-400 mt-1">See recent contributions and updates</p>
      </div>
    );
  }

  return (
    <div className={cn('divide-y divide-gray-100', className)}>
      {entries.map((entry) => (
        <ActivityCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
};
