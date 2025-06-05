import { FC, useState } from 'react';
import { Plus, ChevronDown, Star, Clock, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { FeedItemFundraise } from '@/components/Feed/items/FeedItemFundraise';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';
import { PreregistrationForModal } from '@/services/post.service';
import { ContentType } from '@/types/work';
import { useFundingFeed } from '@/hooks/useFundingFeed';
import { FeedPostContent, FeedContentType } from '@/types/feed';
import { CommentLoader } from '@/components/Comment/CommentLoader';

interface GrantApplicationsProps {
  grantId: number;
}

type SortOption = {
  label: string;
  value: string;
  icon: typeof Star | typeof Clock | typeof ArrowUp;
};

const sortOptions: SortOption[] = [
  { label: 'Best', value: 'personalized', icon: Star },
  { label: 'Newest', value: 'newest', icon: Clock },
  { label: 'Top', value: 'top', icon: ArrowUp },
];

/**
 * Displays a list of applications (preregistrations) for a grant as a feed.
 * Uses the real funding feed data via useFundingFeed hook.
 */
export const GrantApplications: FC<GrantApplicationsProps> = ({ grantId }) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Use the real funding feed hook with sorting
  const { entries, isLoading, error, sortBy, setSortBy } = useFundingFeed(20, grantId);

  const handleUseSelectedPrereg = (prereg: PreregistrationForModal) => {
    console.log(
      'Apply using selected preregistration from GrantApplications:',
      prereg,
      'for grantId:',
      grantId
    );
    setIsApplyModalOpen(false);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          {/* Sort dropdown (left) */}
          <BaseMenu
            align="start"
            trigger={
              <Button variant="outlined" size="sm" className="flex items-center gap-1">
                {(() => {
                  const currentOption = sortOptions.find((option) => option.value === sortBy);
                  const Icon = currentOption?.icon || Star;
                  return <Icon className="h-4 w-4 mr-1" />;
                })()}
                <span>
                  {sortOptions.find((option) => option.value === sortBy)?.label || 'Sort'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
          >
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <BaseMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
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

          <Button
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setIsApplyModalOpen(true)}
          >
            <Plus className="h-4 w-4" /> Submit Application
          </Button>
        </div>

        {/* Use CommentLoader for skeleton */}
        <CommentLoader count={3} />

        <ApplyToGrantModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onUseSelected={handleUseSelectedPrereg}
          grantId={grantId}
        />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          {/* Sort dropdown (left) */}
          <BaseMenu
            align="start"
            trigger={
              <Button variant="outlined" size="sm" className="flex items-center gap-1">
                {(() => {
                  const currentOption = sortOptions.find((option) => option.value === sortBy);
                  const Icon = currentOption?.icon || Star;
                  return <Icon className="h-4 w-4 mr-1" />;
                })()}
                <span>
                  {sortOptions.find((option) => option.value === sortBy)?.label || 'Sort'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
          >
            {sortOptions.map((option) => {
              const Icon = option.icon;
              return (
                <BaseMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
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

          <Button
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setIsApplyModalOpen(true)}
          >
            <Plus className="h-4 w-4" /> Submit Application
          </Button>
        </div>

        <div className="text-center py-10">
          <p className="text-gray-500">Failed to load applications. Please try again later.</p>
        </div>

        <ApplyToGrantModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onUseSelected={handleUseSelectedPrereg}
          grantId={grantId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Row with bottom divider */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        {/* Sort dropdown (left) */}
        <BaseMenu
          align="start"
          trigger={
            <Button variant="outlined" size="sm" className="flex items-center gap-1">
              {(() => {
                const currentOption = sortOptions.find((option) => option.value === sortBy);
                const Icon = currentOption?.icon || Star;
                return <Icon className="h-4 w-4 mr-1" />;
              })()}
              <span>{sortOptions.find((option) => option.value === sortBy)?.label || 'Sort'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          }
        >
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <BaseMenuItem
                key={option.value}
                onClick={() => handleSortChange(option.value)}
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

        {/* CTA (right) */}
        <Button
          size="sm"
          className="flex items-center gap-1"
          onClick={() => {
            setIsApplyModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Submit Application
        </Button>
      </div>

      {/* Render Preregistration Feed Items directly */}
      {entries.length > 0 ? (
        entries.map((entry) => {
          const content = entry.content as FeedPostContent;
          const href = content.slug ? `/post/${content.slug}` : undefined;

          return (
            <div key={entry.id} className="mb-4">
              <FeedItemFundraise
                entry={entry}
                href={href}
                showTooltips={true}
                badgeVariant="default"
                showActions={true}
                customActionText="applied to grant"
              />
            </div>
          );
        })
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No applications submitted yet.</p>
        </div>
      )}

      <ApplyToGrantModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onUseSelected={handleUseSelectedPrereg}
        grantId={grantId}
      />
    </div>
  );
};
