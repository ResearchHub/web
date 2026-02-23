'use client';

import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Activity } from 'lucide-react';
import { GrantAmountSection } from './components/GrantAmountSection';
import { ActivityFeedOverview } from '@/components/Funding/ActivityFeedOverview';
import type { FeedEntry } from '@/types/feed';

interface GrantRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
  activityEntries?: FeedEntry[];
}

export const GrantRightSidebar = ({ work, metadata, activityEntries }: GrantRightSidebarProps) => {
  return (
    <div className="space-y-8 mt-2">
      <GrantAmountSection work={work} />
      <div className="px-2">
        <div className="flex items-center gap-2 mb-8">
          <Activity size={18} className="text-gray-800" />
          <h2 className="text-lg font-semibold text-gray-900">Recent activity</h2>
        </div>
        <ActivityFeedOverview entries={activityEntries} />
      </div>
    </div>
  );
};
