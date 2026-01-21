'use client';

import { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, ChevronDown, Star, Clock, ArrowUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { FeedItemFundraise } from '@/components/Feed/items/FeedItemFundraise';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';
import { ProposalForModal } from '@/services/post.service';
import { useFundingFeed } from '@/hooks/useFundingFeed';
import { FeedPostContent } from '@/types/feed';
import { CommentLoader } from '@/components/Comment/CommentLoader';
import { useInView } from 'react-intersection-observer';

interface GrantApplicationsProps {
  grantId: number;
}

type SortOption = {
  label: string;
  value: string;
  icon: typeof Star | typeof Clock | typeof ArrowUp;
};

const sortOptions: SortOption[] = [
  { label: 'Best', value: 'best', icon: Star },
  { label: 'Newest', value: 'newest', icon: Clock },
  { label: 'Top', value: 'upvotes', icon: ArrowUp },
];

/**
 * Displays a list of applications (proposals) for a grant as a feed.
 */
export const GrantApplications: FC<GrantApplicationsProps> = ({ grantId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { entries, isLoading, isLoadingMore, error, hasMore, loadMore, sortBy, setSortBy } =
    useFundingFeed(20, grantId);

  const { ref: sentinelRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, isLoadingMore, loadMore]);

  const currentSortOption = useMemo(
    () => sortOptions.find((opt) => opt.value === sortBy),
    [sortBy]
  );

  const SortIcon = currentSortOption?.icon ?? Star;

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleProposalSelected = useCallback((_proposal: ProposalForModal) => {
    setIsModalOpen(false);
  }, []);

  const renderSortButton = () => (
    <BaseMenu
      align="start"
      trigger={
        <Button variant="outlined" size="sm" className="flex items-center gap-1">
          <SortIcon className="h-4 w-4 mr-1" />
          <span>{currentSortOption?.label ?? 'Sort'}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      }
    >
      {sortOptions.map((option) => {
        const Icon = option.icon;
        return (
          <BaseMenuItem
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={sortBy === option.value ? 'bg-gray-100' : ''}
          >
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{option.label}</span>
            </div>
          </BaseMenuItem>
        );
      })}
    </BaseMenu>
  );

  const renderHeader = () => (
    <div className="flex items-center justify-between border-b border-gray-200 pb-2">
      {renderSortButton()}
      <Button size="sm" className="flex items-center gap-1" onClick={openModal}>
        <Plus className="h-4 w-4" /> Submit application
      </Button>
    </div>
  );

  const renderEmptyState = (message: string) => (
    <div className="text-center py-10">
      <p className="text-gray-500">{message}</p>
    </div>
  );

  const renderEntries = () => (
    <>
      {entries.map((entry) => {
        const content = entry.content as FeedPostContent;
        const href = content.id && content.slug ? `/post/${content.id}/${content.slug}` : undefined;

        return (
          <div key={entry.id} className="mb-4">
            <FeedItemFundraise
              entry={entry}
              href={href}
              showTooltips
              showActions
              customActionText="applied to RFP"
            />
          </div>
        );
      })}

      {hasMore && (
        <div ref={sentinelRef} className="h-10 flex items-center justify-center">
          {isLoadingMore && (
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading more...
            </span>
          )}
        </div>
      )}
    </>
  );

  const renderContent = () => {
    if (isLoading) return <CommentLoader count={3} />;
    if (error) return renderEmptyState('Failed to load applications. Please try again later.');
    if (entries.length === 0) return renderEmptyState('No applications submitted yet.');
    return renderEntries();
  };

  return (
    <div className="space-y-6">
      {renderHeader()}
      {renderContent()}

      <ApplyToGrantModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onUseSelected={handleProposalSelected}
        grantId={grantId.toString()}
      />
    </div>
  );
};
