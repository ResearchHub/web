'use client';

import { FC, ReactNode } from 'react';
import { Activity } from 'lucide-react';
import { ActivityCard } from './ActivityCard';
import type { FeedEntry } from '@/types/feed';
import { SidebarHeader } from '../ui/SidebarHeader';

interface FundingSidebarProps {
  topSection?: ReactNode;
  entries?: FeedEntry[];
}

export const FundingSidebar: FC<FundingSidebarProps> = ({ topSection, entries }) => {
  const hasEntries = entries && entries.length > 0;

  return (
    <div data-activity-sidebar className="h-full">
      {topSection && (
        <>
          <div className="px-6 pt-2">{topSection}</div>
          <div className="border-b border-gray-200 my-6" />
        </>
      )}

      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 mb-6">
          <SidebarHeader title="Recent activity" />
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
          <div className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <ActivityCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
