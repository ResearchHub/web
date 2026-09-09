'use client';

import { type ReactNode, useState, useCallback } from 'react';
import { ArrowUpFromLine, Coins, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { SubmitProposalTooltip } from '@/components/tooltips/SubmitProposalTooltip';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { useGrantTab, type GrantBannerTab } from '@/components/Funding/GrantPageContent';
import { useFundraises } from '@/contexts/FundraiseContext';
import type { FundingPool, GrantApplicationVisibility } from '@/types/grant';
import { WorkHeader } from './WorkHeader';
import { WorkHeaderGrantEyebrow } from './WorkHeaderGrantEyebrow';

interface WorkHeaderGrantProps {
  work: Work;
  metadata: WorkMetadata;
  amountUsd?: number;
  grantAmountUsd?: number;
  grantId?: string;
  isActive?: boolean;
  isPending?: boolean;
  organization?: string;
  applicationVisibility?: GrantApplicationVisibility;
  fundingPool?: FundingPool | null;
  className?: string;
  preTitle?: ReactNode;
}

export function WorkHeaderGrant({
  work,
  metadata,
  amountUsd,
  grantAmountUsd,
  grantId,
  isActive = true,
  isPending = false,
  organization,
  applicationVisibility,
  fundingPool = null,
  className,
  preTitle,
}: WorkHeaderGrantProps) {
  const router = useRouter();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const { activeTab, setActiveTab, activity } = useGrantTab();
  const { proposalCount } = useFundraises();

  const handleTabChange = useCallback(
    (tabId: string) => setActiveTab(tabId as GrantBannerTab),
    [setActiveTab]
  );

  const eyebrow = (
    <WorkHeaderGrantEyebrow amountUsd={amountUsd} isActive={isActive} isPending={isPending} />
  );

  const requiresPrivateApplications = applicationVisibility === 'PRIVATE';
  const canContributeToPool = !!grantId && isActive && fundingPool?.status === 'OPEN';

  const handleContributeSuccess = useCallback(() => {
    setIsContributeModalOpen(false);
    router.refresh();
  }, [router]);

  const subtitle = organization ? (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="text-base text-gray-500">Offered by</span>
      <span className="text-base text-gray-600 font-medium">{organization}</span>
    </div>
  ) : undefined;

  const primaryAction =
    grantId && isActive ? (
      <>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          {canContributeToPool && (
            <Button
              data-testid="grant-contribute"
              variant="outlined"
              size="lg"
              onClick={() => setIsContributeModalOpen(true)}
              className="gap-2 w-full sm:flex-1 max-sm:!text-xs max-sm:!h-8 max-sm:!px-2"
            >
              <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
              Contribute
            </Button>
          )}
          <SubmitProposalTooltip isPrivate={requiresPrivateApplications}>
            <Button
              data-testid="grant-submit-proposal"
              variant="default"
              size="lg"
              onClick={() => setIsApplyModalOpen(true)}
              className="gap-2 w-full sm:flex-1 max-sm:!text-xs max-sm:!h-8 max-sm:!px-2"
            >
              Submit Proposal
              <ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </SubmitProposalTooltip>
        </div>
        {requiresPrivateApplications && (
          <div className="hidden sm:flex items-center justify-center gap-1.5 text-xs text-gray-500">
            <Lock className="h-3 w-3 shrink-0" />
            <span>Your proposal will be submitted privately</span>
          </div>
        )}
      </>
    ) : undefined;

  const activityCount = activity.count;
  const activityCountLabel =
    activityCount > 0 && activity.hasMore ? `${activityCount}+` : activityCount;

  const grantTabs = [
    { id: 'details' as const, label: 'Details' },
    {
      id: 'proposals' as const,
      label: (
        <div className="flex items-center">
          <span>Proposals</span>
          {proposalCount > 0 && (
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'proposals'
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {proposalCount}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'activity' as const,
      label: (
        <div className="flex items-center">
          <span>Updates</span>
          {activityCount > 0 && (
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'activity'
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {activityCountLabel}
            </span>
          )}
        </div>
      ),
    },
  ];

  const tabs = <Tabs tabs={grantTabs} activeTab={activeTab} onTabChange={handleTabChange} />;

  const grantTitle = work.note?.post?.grant?.shortTitle || work.title;

  return (
    <>
      <WorkHeader
        work={work}
        metadata={metadata}
        className={className}
        eyebrow={eyebrow}
        preTitle={preTitle}
        subtitle={subtitle}
        tabs={tabs}
        primaryAction={primaryAction}
        hideVoteWidget
        grantModalProps={
          grantId
            ? {
                isApplyToGrantModalOpen: isApplyModalOpen,
                onCloseApplyToGrantModal: () => setIsApplyModalOpen(false),
                grantId,
                grantApplicationVisibility: applicationVisibility,
              }
            : undefined
        }
      />

      {fundingPool?.status === 'OPEN' && (
        <ContributeToFundraiseModal
          mode="fundingPool"
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          onContributeSuccess={handleContributeSuccess}
          fundingPool={fundingPool}
          grantAmount={{ usd: grantAmountUsd ?? amountUsd ?? 0 }}
          proposalTitle={grantTitle}
        />
      )}
    </>
  );
}
