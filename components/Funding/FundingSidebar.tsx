'use client';

import { FC, ReactNode } from 'react';
import { Activity, Reply } from 'lucide-react';
import { ActivityCard } from './ActivityCard';
import type { FeedEntry } from '@/types/feed';
import { SidebarHeader } from '../ui/SidebarHeader';

interface FundingSidebarProps {
  topSection?: ReactNode;
  entries?: FeedEntry[];
  grantTitle?: string;
}

export const FundingSidebar: FC<FundingSidebarProps> = ({ topSection, entries, grantTitle }) => {
  const hasEntries = entries && entries.length > 0;

  return (
    <div data-activity-sidebar className="h-full">
      {topSection && (
        <>
          <div className="px-2 pt-2">{topSection}</div>
          <div className="border-b border-gray-200 -ml-4 -mr-4 my-6" />
        </>
      )}

      <div className="px-4 pb-6">
        <div className="mb-6">
          <SidebarHeader title="Recent Activity" />
          {grantTitle && (
            <div className="flex items-start gap-1.5 mt-1">
              <Reply className="w-4 h-4 text-gray-400 rotate-180 flex-shrink-0" />
              <span className="text-sm text-gray-500">{grantTitle}</span>
            </div>
          )}
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
