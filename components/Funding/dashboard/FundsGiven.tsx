'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FunderHero } from '@/components/Funding/dashboard/FunderHero';
import { FunderAuthorPostsSection } from '@/components/Funding/dashboard/FunderAuthorPostsSection';
import { FundedProposalsSection } from '@/components/Funding/dashboard/FundedProposalsSection';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FunderService } from '@/services/funder.service';
import { useFeed } from '@/hooks/useFeed';
import { FunderOverview } from '@/types/funder';
import {
  SearchableUserSingleSelect,
  UserOption,
} from '@/components/ui/form/SearchableUserSingleSelect';

function parseUserIdParam(userIdParam: string | null): number | undefined {
  if (!userIdParam) return undefined;
  const userId = Number(userIdParam);
  return Number.isInteger(userId) && userId > 0 ? userId : undefined;
}

interface FundsGivenProps {
  userId: number;
  isModerator: boolean;
}

export function FundsGiven({ userId, isModerator }: Readonly<FundsGivenProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const viewedUserId = isModerator
    ? (parseUserIdParam(searchParams.get('user_id')) ?? userId)
    : userId;

  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);

  const handleUserSelect = useCallback(
    (selected: UserOption | null) => {
      setSelectedUser(selected);
      const params = new URLSearchParams(searchParams.toString());
      if (selected) {
        params.set('user_id', selected.value);
      } else {
        params.delete('user_id');
      }
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const [overview, setOverview] = useState<FunderOverview | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);

  const grantFeedOptions = useMemo(
    () => ({
      endpoint: 'grant_feed' as const,
      contentType: 'GRANT',
      createdBy: viewedUserId,
    }),
    [viewedUserId]
  );

  const {
    entries: opportunities,
    isLoading: isLoadingOpportunities,
    hasMore,
    loadMore,
  } = useFeed('all', grantFeedOptions);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingOverview(true);
    FunderService.getFundingOverview(viewedUserId)
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch(() => {
        if (!cancelled) setOverview(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingOverview(false);
      });
    return () => {
      cancelled = true;
    };
  }, [viewedUserId]);

  let overviewContent: ReactNode = null;
  if (isLoadingOverview) {
    overviewContent = (
      <div className="h-[272px] tablet:h-[200px] rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
    );
  } else if (overview) {
    overviewContent = <FunderHero overview={overview} />;
  }

  return (
    <>
      {isModerator && (
        <div className="mb-5 max-w-xs">
          <p className="mb-1 text-xs font-medium text-gray-500">View as user (moderator only)</p>
          <SearchableUserSingleSelect
            value={selectedUser}
            onChange={handleUserSelect}
            placeholder="Search for a funder..."
          />
        </div>
      )}

      {overviewContent}

      <FunderAuthorPostsSection funderId={viewedUserId} className="mt-6" />

      <div className="mt-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2">
          <div className="flex items-baseline gap-2.5">
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">
              My Requests for Proposals
            </h2>
            {!isLoadingOpportunities && (
              <span className="text-xs text-gray-500">{opportunities.length} active</span>
            )}
          </div>
          {!isLoadingOpportunities && opportunities.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/notebook?newGrant=true')}
            >
              <Plus size={14} />
              New RFP
            </Button>
          )}
        </div>

        <FeedContent
          entries={opportunities}
          isLoading={isLoadingOpportunities}
          hasMore={hasMore}
          loadMore={loadMore}
          wideContent
          skeletonVariant="grant"
          showGrantApplyCta={false}
          showGrantHeaders={false}
          showPostHeaders={false}
          showFundraiseHeaders={false}
          noEntriesElement={
            <div className="rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center">
              <p className="text-sm text-gray-500">You haven&apos;t created any RFPs yet.</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => router.push('/notebook?newGrant=true')}
              >
                <Plus size={14} />
                New RFP
              </Button>
            </div>
          }
        />
      </div>

      {overview && (
        <FundedProposalsSection proposals={overview.supportedProposals} className="mt-8" />
      )}
    </>
  );
}
