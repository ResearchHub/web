import { FC } from 'react';
import { useFeed } from '@/hooks/useFeed';
import { FeedContent } from '@/components/Feed/FeedContent';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';
import { Plus, ChevronDown } from 'lucide-react';
import { SortDropdown } from '@/components/ui/SortDropdown';
import { useState } from 'react';

interface GrantApplicationsProps {
  grantId: number; // Currently unused but can be used for filtering later
}

/**
 * Displays a list of applications (preregistrations) for a grant as a feed.
 * This is a demo component – it simply fetches the global funding feed and
 * renders each preregistration using the existing FeedItemFundraise card.
 * In the future, we can filter by `grantId` once the API supports it.
 */
export const GrantApplications: FC<GrantApplicationsProps> = ({ grantId }) => {
  const [sortBy, setSortBy] = useState<string>('personalized');

  // Fetch preregistration items from the funding feed
  const { entries, isLoading, hasMore, loadMore } = useFeed('all' as any, {
    contentType: 'PREREGISTRATION',
    endpoint: 'funding_feed',
    fundraiseStatus: 'OPEN',
  });

  return (
    <div className="space-y-6">
      {/* Header Row with bottom divider */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        {/* Sort dropdown (left) */}
        <SortDropdown value={sortBy} onChange={(opt) => setSortBy(opt.value)} className="w-auto" />

        {/* CTA (right) */}
        <BaseMenu
          trigger={
            <Button size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Submit Application <ChevronDown className="h-4 w-4" />
            </Button>
          }
          align="end"
          sideOffset={4}
        >
          <BaseMenuItem onSelect={() => console.log('new-prereg')}>
            Add new preregistration
          </BaseMenuItem>
          <BaseMenuItem onSelect={() => console.log('submit-existing')}>
            Submit existing preregistration
          </BaseMenuItem>
        </BaseMenu>
      </div>

      {/* Feed entries */}
      <FeedContent
        entries={entries}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        activeTab={undefined as any}
      />
    </div>
  );
};
