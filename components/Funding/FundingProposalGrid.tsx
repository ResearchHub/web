'use client';

import { FC } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useFundraises } from '@/contexts/FundraiseContext';
import { FundingGrantTabs } from './FundingGrantTabs';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/styles';

interface FundingProposalGridProps {
  className?: string;
  /** Content rendered between the tab navigation and the proposal list */
  belowNavContent?: React.ReactNode;
}

export const FundingProposalGrid: FC<FundingProposalGridProps> = ({
  className,
  belowNavContent,
}) => {
  const { entries, isLoading, isLoadingMore, hasMore, loadMore } = useFundraises();
  const pathname = usePathname();
  const isGrantDetail = pathname.startsWith('/fund/grant/');

  const tabs = <FundingGrantTabs />;

  const banner = (
    <>
      {belowNavContent && <div>{belowNavContent}</div>}
      {isGrantDetail && (
        <p className="text-sm text-gray-600 mt-2">
          {isLoading ? (
            '\u00A0'
          ) : (
            <span>
              <span className="font-semibold">
                {entries.length} proposal{entries.length !== 1 ? 's' : ''}
              </span>{' '}
              competing for award
            </span>
          )}
        </p>
      )}
    </>
  );

  return (
    <div className={cn('', className)}>
      <FeedContent
        entries={entries}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        loadMore={loadMore}
        tabs={tabs}
        banner={banner}
        showFundraiseHeaders={false}
        showGrantHeaders={false}
        showPostHeaders={false}
        noEntriesElement={
          <div className="py-12 text-center">
            <p className="text-gray-500">No proposals found</p>
          </div>
        }
      />
    </div>
  );
};
