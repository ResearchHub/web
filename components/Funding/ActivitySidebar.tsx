'use client';

import { FC } from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/utils/styles';
import { ActivityFeedOverview } from './ActivityFeedOverview';
import type { FeedEntry } from '@/types/feed';

interface ActivitySidebarProps {
  entries?: FeedEntry[];
  className?: string;
}

export const ActivitySidebar: FC<ActivitySidebarProps> = ({ entries, className }) => {
  return (
    <div data-activity-sidebar className={cn('p-6 h-full', className)}>
      <div className="flex items-center gap-2 mb-8">
        <Activity size={18} className="text-gray-800" />
        <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
      </div>
      <ActivityFeedOverview entries={entries} />
    </div>
  );
};
