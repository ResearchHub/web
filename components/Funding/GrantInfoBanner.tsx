'use client';

import { useState } from 'react';
import { ArrowUpFromLine, Share } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons';
import { ApplyToGrantModal } from '@/components/modals/ApplyToGrantModal';
import { SubmitProposalTooltip } from '@/components/tooltips/SubmitProposalTooltip';
import { AddToListModal } from '@/components/UserList/AddToListModal';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { Work } from '@/types/work';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useIsInList } from '@/components/UserList/lib/hooks/useIsInList';
import { useAddToList } from '@/components/UserList/lib/UserListsContext';

function formatCompactAmount(usd: number): string {
  if (usd >= 1_000_000) return `$${Math.round(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${Math.round(usd / 1_000)}K`;
  return `$${Math.round(usd).toLocaleString()}`;
}

export type GrantBannerTab = 'proposals' | 'details';

const GRANT_BANNER_TABS = [
  { id: 'proposals' as const, label: 'Proposals' },
  { id: 'details' as const, label: 'Details' },
];

interface GrantInfoBannerProps {
  className?: string;
  amountUsd?: number;
  grantId?: string;
  isActive?: boolean;
  work?: Work;
  organization?: string;
  activeTab?: GrantBannerTab;
  onTabChange?: (tab: GrantBannerTab) => void;
}

export const GrantInfoBanner = ({
  className,
  amountUsd,
  grantId,
  isActive = true,
  work,
  organization,
  activeTab = 'proposals',
  onTabChange,
}: GrantInfoBannerProps) => {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const { showShareModal } = useShareModalContext();
  const { isInList } = useIsInList(work?.unifiedDocumentId);
  const { isTogglingDefaultList, handleAddToList } = useAddToList({
    unifiedDocumentId: work?.unifiedDocumentId,
    isInList,
    onOpenModal: () => setIsAddToListModalOpen(true),
  });

  return (
    <>
      <div className={cn('w-full bg-gray-50/80 border-b border-gray-200', className)}>
        <div className="max-w-[1180px] mx-auto pl-4 tablet:!pl-8 pr-4 tablet:!pr-0">
          <div className="flex items-center gap-6">
            <div className={cn('flex-1 min-w-0 pt-5', !onTabChange && 'pb-5')}>
              {amountUsd != null && amountUsd > 0 && (
                <div className="mb-1.5">
                  <span
                    className={cn(
                      'font-mono font-bold text-base px-2.5 py-0.5 rounded-md tabular-nums',
                      isActive ? 'text-green-700 bg-green-100' : 'text-gray-500 bg-gray-100'
                    )}
                  >
                    {formatCompactAmount(amountUsd)} available
                  </span>
                </div>
              )}

              {work?.title && (
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
                  {work.title}
                </h1>
              )}

              {organization && (
                <p className="text-base text-gray-700 mt-[10px]">Offered by {organization}</p>
              )}

              {onTabChange && (
                <div className="mt-4">
                  <Tabs
                    tabs={GRANT_BANNER_TABS}
                    activeTab={activeTab}
                    onTabChange={(tabId) => onTabChange(tabId as GrantBannerTab)}
                  />
                </div>
              )}
            </div>

            <div className="flex-shrink-0 flex flex-col items-stretch gap-2">
              {grantId && isActive && (
                <SubmitProposalTooltip>
                  <Button
                    variant="default"
                    size="lg"
                    onClick={() => setIsApplyModalOpen(true)}
                    className="gap-2 w-full"
                  >
                    Submit Proposal
                    <ArrowUpFromLine className="w-5 h-5" />
                  </Button>
                </SubmitProposalTooltip>
              )}

              <div className="flex items-center gap-2 justify-center">
                <Button
                  variant="outlined"
                  size="lg"
                  className="flex-1 gap-2"
                  aria-label="Share"
                  onClick={() =>
                    showShareModal({
                      url: window.location.href,
                      docTitle: work?.title || '',
                      action: 'USER_SHARED_DOCUMENT',
                      shouldShowConfetti: false,
                    })
                  }
                >
                  <Share className="h-4 w-4" />
                  <span className="text-sm">Share</span>
                </Button>

                {work?.unifiedDocumentId && (
                  <Button
                    variant="outlined"
                    size="lg"
                    onClick={handleAddToList}
                    disabled={isTogglingDefaultList}
                    className={cn('flex-1 gap-2', isInList && 'text-green-600 border-green-300')}
                    aria-label="Save"
                  >
                    <FontAwesomeIcon
                      icon={isInList ? faBookmarkSolid : faBookmark}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">Save</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {grantId && (
        <ApplyToGrantModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onUseSelected={() => setIsApplyModalOpen(false)}
          grantId={grantId}
          grantTitle={work?.title}
          grantAmountUsd={amountUsd}
        />
      )}

      {work?.unifiedDocumentId && (
        <AddToListModal
          isOpen={isAddToListModalOpen}
          onClose={() => setIsAddToListModalOpen(false)}
          unifiedDocumentId={work.unifiedDocumentId}
        />
      )}
    </>
  );
};
